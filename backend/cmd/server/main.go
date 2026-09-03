package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func initDB() {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "/app/data/calendars.db"
	}
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		log.Fatalf("Failed to create data dir: %v", err)
	}
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS clients (
		id TEXT PRIMARY KEY,
		name TEXT,
		niche TEXT,
		platforms TEXT,
		tone TEXT,
		created_at TEXT
	)`)
	if err != nil {
		log.Fatalf("Failed to create clients table: %v", err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS calendar_entries (
		id TEXT PRIMARY KEY,
		client_id TEXT,
		date TEXT,
		post_type TEXT,
		platform TEXT,
		caption TEXT,
		hashtags TEXT,
		status TEXT DEFAULT 'draft',
		created_at TEXT
	)`)
	if err != nil {
		log.Fatalf("Failed to create calendar_entries table: %v", err)
	}
}

type ClientReq struct {
	Name      string   `json:"name" binding:"required"`
	Niche     string   `json:"niche"`
	Platforms []string `json:"platforms"`
	Tone      string   `json:"tone"`
}

type GenReq struct {
	ClientID     string `json:"client_id"`
	Month        string `json:"month"`
	PostsPerWeek int    `json:"posts_per_week"`
}

func main() {
	initDB()
	defer db.Close()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"service": "Content Calendars API", "version": "1.0.0"})
	})

	router.POST("/clients", func(c *gin.Context) {
		var req ClientReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		cid := uuid.New().String()
		if req.Niche == "" {
			req.Niche = "general"
		}
		if len(req.Platforms) == 0 {
			req.Platforms = []string{"instagram", "twitter"}
		}
		if req.Tone == "" {
			req.Tone = "professional"
		}
		_, err := db.Exec("INSERT INTO clients (id,name,niche,platforms,tone,created_at) VALUES (?,?,?,?,?,?)",
			cid, req.Name, req.Niche, strings.Join(req.Platforms, ","), req.Tone, time.Now().UTC().Format(time.RFC3339))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"client_id": cid})
	})

	router.GET("/clients", func(c *gin.Context) {
		rows, err := db.Query("SELECT * FROM clients ORDER BY created_at DESC")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		clients := []map[string]interface{}{}
		for rows.Next() {
			var id, name, niche, platforms, tone, createdAt string
			if err := rows.Scan(&id, &name, &niche, &platforms, &tone, &createdAt); err != nil {
				continue
			}
			clients = append(clients, map[string]interface{}{
				"id": id, "name": name, "niche": niche, "platforms": platforms, "tone": tone, "created_at": createdAt,
			})
		}
		c.JSON(200, gin.H{"clients": clients})
	})

	router.POST("/clients/:cid/generate", func(c *gin.Context) {
		cid := c.Param("cid")
		var req GenReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		var name, niche, platformsStr string
		err := db.QueryRow("SELECT name, niche, platforms FROM clients WHERE id=?", cid).Scan(&name, &niche, &platformsStr)
		if err != nil {
			c.JSON(404, gin.H{"error": "Client not found"})
			return
		}
		month := req.Month
		if month == "" {
			month = time.Now().UTC().Format("2006-01")
		}
		platforms := strings.Split(platformsStr, ",")
		postTypes := []string{"carousel", "single", "text", "video", "story"}
		captions := []string{
			"Ready to level up your {niche} knowledge? Here's our weekly tip.",
			"Behind the scenes: how we help {niche} businesses thrive.",
			"3 things every {niche} business needs to know this week.",
			"Case study: How one client transformed their {niche} results.",
			"Your weekly {niche} insight — what's working right now.",
		}
		if req.PostsPerWeek <= 0 {
			req.PostsPerWeek = 5
		}
		count := 0
		monthStart, _ := time.Parse("2006-01-02", month+"-01")
		for week := 0; week < 4; week++ {
			for i := 0; i < req.PostsPerWeek; i++ {
				dayOffset := week*7 + i
				date := monthStart.AddDate(0, 0, dayOffset).Format("2006-01-02")
				for _, plat := range platforms {
					caption := strings.ReplaceAll(captions[count%len(captions)], "{niche}", niche)
					hashtags := fmt.Sprintf("#%s #%s #business #growth", strings.ReplaceAll(niche, " ", ""), plat)
					eid := uuid.New().String()
					_, err := db.Exec("INSERT INTO calendar_entries (id,client_id,date,post_type,platform,caption,hashtags,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
						eid, cid, date, postTypes[count%len(postTypes)], plat, caption, hashtags, "scheduled", time.Now().UTC().Format(time.RFC3339))
					if err != nil {
						continue
					}
					count++
				}
			}
		}
		c.JSON(200, gin.H{"generated": count, "client": name, "month": month})
	})

	router.GET("/clients/:cid/calendar/:month", func(c *gin.Context) {
		cid := c.Param("cid")
		month := c.Param("month")
		rows, err := db.Query("SELECT * FROM calendar_entries WHERE client_id=? AND date LIKE ? ORDER BY date", cid, month+"%")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		entries := []map[string]interface{}{}
		for rows.Next() {
			var id, clientID, date, postType, platform, caption, hashtags, status, createdAt string
			if err := rows.Scan(&id, &clientID, &date, &postType, &platform, &caption, &hashtags, &status, &createdAt); err != nil {
				continue
			}
			entries = append(entries, map[string]interface{}{
				"id": id, "client_id": clientID, "date": date, "post_type": postType,
				"platform": platform, "caption": caption, "hashtags": hashtags,
				"status": status, "created_at": createdAt,
			})
		}
		c.JSON(200, gin.H{"calendar": entries, "total": len(entries)})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	log.Printf("Content Calendars server starting on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}