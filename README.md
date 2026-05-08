# Pulse Play 🎵

A futuristic music streaming web application built with React, Node.js/Express, and MySQL.

> **Screenshot placeholder** — add a screenshot of the running app here.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, TanStack Query |
| Backend | Node.js 20, Express 4, mysql2, bcrypt, jsonwebtoken, zod, pino |
| Database | MariaDB / MySQL 8 |
| Infrastructure | Docker Compose, nginx (production frontend) |

---

## Quickstart

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A `.env` file at the project root (copy `.env.example` and fill in real values).

### 1. Create your `.env`

```bash
cp .env.example .env
# Edit .env and set all CHANGE_ME values
```

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # DB passwords
```

### 2. Bring everything up

```bash
docker compose up --build
```

The first boot initialises the database schema automatically.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api/docs |
| Health check | http://localhost:5000/health |

### 3. Tear down

```bash
docker compose down          # stop containers, keep data volume
docker compose down -v       # stop + delete DB volume (fresh start)
```

---

## Environment Variables

See `.env.example` for a fully documented list. Required variables:

| Variable | Description |
|---|---|
| `DB_HOST` | Database hostname (use Docker service name `database`) |
| `DB_PORT` | Database port (default `3306`) |
| `DB_NAME` | Database schema name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password (32+ random chars) |
| `MYSQL_ROOT_PASSWORD` | MariaDB root password (used on first init) |
| `JWT_SECRET` | 64-byte hex JWT signing secret |
| `ALLOWED_ORIGINS` | Comma-separated CORS origin allowlist |
| `VITE_API_URL` | Public URL of the backend (build-time) |

---

## Project Structure

```
Pulse-Play/
├── backend/
│   ├── src/
│   │   ├── config/         # env validation, database pool
│   │   ├── middleware/      # auth, ownership, errorHandler, validate
│   │   ├── routes/          # one file per resource
│   │   ├── services/        # business logic
│   │   ├── schemas/         # zod validation schemas
│   │   └── utils/           # AppError, asyncHandler, logger
│   ├── migrations/          # numbered SQL migration files
│   ├── app.js               # Express app wiring
│   └── server.js            # entry point (thin)
├── frontend/
│   └── src/
│       ├── api/             # typed API call modules
│       ├── components/      # layout, common, music, auth
│       ├── pages/           # one file per route
│       ├── hooks/           # custom React hooks
│       ├── stores/          # Zustand stores
│       ├── lib/             # api client, utils
│       └── styles/          # global CSS, design tokens
├── .env.example
├── .gitignore
└── docker-compose.yml
```

---

## Features

- Stream music with full seek support (HTTP Range)
- Browse songs, artists, albums, and playlists
- Create and manage personal playlists
- Like / unlike songs
- Follow artists
- Personalized recommendations
- Listening history
- Subscription management
- Keyboard shortcuts (Space, ←/→, M, ↑/↓, /, L, Q, ?)
- OS media-key integration via Media Session API
- Glassmorphism / neon design language
- Dark and light themes
- Responsive (mobile 375px → desktop 1920px)

---

## Development

```bash
# Backend (hot-reload)
cd backend && npm install && npm run dev

# Frontend (hot-reload)
cd frontend && npm install && npm run dev
```

Lint & format:
```bash
npm run lint      # in backend/ or frontend/
npm run format    # in backend/ or frontend/
```

Run tests:
```bash
npm test          # in backend/ or frontend/
```

---

## Database Migrations

Migration files live in `backend/migrations/`. Run them in order:

```bash
cd backend && node scripts/migrate.js
```

---

## Security Notes

- Access tokens expire in **15 minutes**.
- Refresh tokens are **HttpOnly, Secure, SameSite=Strict** cookies (7-day lifetime).
- All secrets are loaded from environment variables — never committed.
- Rate limiting: 10 req/15 min on auth endpoints; 100 req/min globally.
- CORS restricted to `ALLOWED_ORIGINS`.

---

## License

MIT
