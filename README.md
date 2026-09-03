# Content Calendars — AI Content Planning

An AI-powered content calendar platform for planning, generating, and scheduling content across multiple platforms.

## Quick Start

```bash
# Clone
git clone https://github.com/lovelymondayz/content-calendars.git
cd content-calendars

# Start all services
docker compose up -d --build

# Dashboard: http://localhost:8104
# API: http://localhost:8103
```

## Features

- **AI Content Generation**: Generate blog posts, social media, emails
- **Visual Calendar**: Drag-and-drop content scheduling
- **Multi-Platform**: Blog, Twitter, LinkedIn, email
- **Content Templates**: Reusable templates for common content
- **Status Tracking**: Draft → Scheduled → Published workflow

## API Endpoints

### Public
- `GET /api/health` — Health check

### Authenticated
- `POST /api/content/generate` — Generate content
- `GET /api/calendar` — Get calendar
- `POST /api/calendar` — Schedule content
- `GET /api/posts` — List posts
- `PUT /api/posts/:id` — Update post

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| OPENAI_API_KEY | - | OpenAI API key |
| PORT | 8000 | Backend port |
| HOST | 0.0.0.0 | Host binding |
| POSTS_PER_WEEK | 5 | Default posts per week |
| PLATFORMS | blog,twitter,linkedin | Enabled platforms |

## Development

```bash
# Backend only
cd backend
pip install -r requirements.txt
uvicorn src.api:app --reload

# Frontend only
cd frontend
npm install
npm run dev
```

## Deployment

1. Push to `main` → GitHub Action auto-deploys
2. Or manually: `ssh vps && cd /root/content-calendars && ./update.sh`

## License

MIT
