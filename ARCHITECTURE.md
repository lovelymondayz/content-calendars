# Content Calendars — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                          │
│               contentcalendars.arjism.com (HTTPS)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel (cf-tunnel)                │
│              http://192.168.88.101:8103 (plain HTTP)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx Reverse Proxy                      │
│                    :8103 → :8000 (backend)                      │
│                    :8104 → :80 (dashboard)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌──────────────────────┐        ┌──────────────────────┐
│   Python + FastAPI   │        │  React Dashboard     │
│   :8000 (internal)   │        │  :80 (internal)      │
│                      │        │                      │
│  - Content Generation│        │  - Tailwind CSS      │
│  - Scheduling        │        │  - Calendar View     │
│  - Multi-platform    │        │  - Content Preview   │
│  - OpenAI            │        │  - Analytics         │
└──────────┬───────────┘        └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│   Local Storage      │
│   /app/data/         │
└──────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Python | 3.11+ |
| Web Framework | FastAPI | 0.115+ |
| AI Integration | OpenAI / 9Router | - |
| Content Generation | GPT-4 / Claude | - |
| Frontend | React + Vite + TypeScript | Vite 5, React 18 |
| Styling | Tailwind CSS | v3 |
| Deployment | Docker Compose | v3.8 |
| Reverse Proxy | Nginx | - |
| Tunnel | Cloudflare Tunnel | - |

## Key Design Decisions

### 1. AI Content Generation
- GPT-4 powered content suggestions
- Multi-platform optimization (blog, social, email)
- Tone and style customization

### 2. Scheduling System
- Automated content scheduling
- Calendar view for visual planning
- Recurring post templates

### 3. Multi-Platform Support
- Blog posts, social media, emails
- Platform-specific formatting
- Cross-platform publishing

### 4. Content Calendar
- Drag-and-drop scheduling
- Visual content pipeline
- Status tracking (draft, scheduled, published)

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Authenticated
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/content/generate` | Generate content |
| GET | `/api/calendar` | Get calendar |
| POST | `/api/calendar` | Schedule content |
| GET | `/api/posts` | List posts |
| PUT | `/api/posts/:id` | Update post |

## Ports

| Service | External | Internal |
|---------|----------|----------|
| Backend | `:8103` | `:8000` |
| Dashboard | `:8104` | `:80` |
