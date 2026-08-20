
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3, os, uuid
from datetime import datetime, timedelta
from pathlib import Path

app = FastAPI(title="Content Calendars API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATABASE_PATH = os.getenv("DATABASE_PATH", "/app/data/calendars.db")
Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, name TEXT, niche TEXT, platforms TEXT, tone TEXT, created_at TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS calendar_entries (id TEXT PRIMARY KEY, client_id TEXT, date TEXT, post_type TEXT, platform TEXT, caption TEXT, hashtags TEXT, status TEXT DEFAULT 'draft', created_at TEXT)")
    conn.commit(); conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE_PATH); conn.row_factory = sqlite3.Row; return conn

class ClientReq(BaseModel):
    name: str
    niche: str = "general"
    platforms: list[str] = ["instagram", "twitter"]
    tone: str = "professional"

class GenReq(BaseModel):
    client_id: str
    month: str = ""
    posts_per_week: int = 5

@app.get("/health")
async def health(): return {"status": "healthy"}

@app.get("/")
async def root(): return {"service": "Content Calendars API", "version": "1.0.0"}

@app.post("/clients")
async def add_client(req: ClientReq):
    cid = str(uuid.uuid4())
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO clients (id,name,niche,platforms,tone,created_at) VALUES (?,?,?,?,?,?)",
        (cid, req.name, req.niche, ",".join(req.platforms), req.tone, datetime.utcnow().isoformat()))
    conn.commit(); conn.close()
    return {"client_id": cid}

@app.get("/clients")
async def list_clients():
    conn = get_db()
    clients = [dict(r) for r in conn.execute("SELECT * FROM clients ORDER BY created_at DESC").fetchall()]
    conn.close(); return {"clients": clients}

@app.post("/clients/{cid}/generate")
async def generate(cid: str, req: GenReq):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM clients WHERE id=?", (cid,))
    client = c.fetchone()
    if not client: conn.close(); raise HTTPException(404, "Client not found")
    month = req.month or datetime.utcnow().strftime("%Y-%m")
    platforms = client["platforms"].split(",")
    post_types = ["carousel", "single", "text", "video", "story"]
    captions = [
        "Ready to level up your {niche} knowledge? Here's our weekly tip.",
        "Behind the scenes: how we help {niche} businesses thrive.",
        "3 things every {niche} business needs to know this week.",
        "Case study: How one client transformed their {niche} results.",
        "Your weekly {niche} insight — what's working right now.",
    ]
    count = 0
    for week in range(4):
        for i in range(req.posts_per_week):
            day_offset = week * 7 + i
            date = (datetime.strptime(month + "-01", "%Y-%m-%d") + timedelta(days=day_offset)).strftime("%Y-%m-%d")
            for plat in platforms:
                caption = captions[count % len(captions)].format(niche=client["niche"])
                hashtags = " ".join([f"#{client['niche'].replace(' ','')}", f"#{plat}", "#business", "#growth"])
                eid = str(uuid.uuid4())
                c.execute("INSERT INTO calendar_entries (id,client_id,date,post_type,platform,caption,hashtags,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
                    (eid, cid, date, post_types[count % len(post_types)], plat, caption, hashtags, "scheduled", datetime.utcnow().isoformat()))
                count += 1
    conn.commit(); conn.close()
    return {"generated": count, "client": client["name"], "month": month}

@app.get("/clients/{cid}/calendar/{month}")
async def get_calendar(cid: str, month: str):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM calendar_entries WHERE client_id=? AND date LIKE ? ORDER BY date", (cid, f"{month}%"))
    entries = [dict(r) for r in c.fetchall()]
    conn.close(); return {"calendar": entries, "total": len(entries)}

@app.on_event("startup")
async def startup(): init_db()
