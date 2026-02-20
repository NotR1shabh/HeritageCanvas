# Heritage Canvas

Production-ready full-stack layout with a Vite frontend and an Express backend.

## Structure

```
project-root/
  client/     # Vite + React frontend
  server/     # Express + Node backend
  shared/     # (optional) shared utilities/data
  README.md
```

## Quick Start

### Frontend (Vite)

```bash
npm run dev --prefix client
```

### Backend (Express)

```bash
npm run dev --prefix server
```

### PM2 (both servers)

```powershell
./start-servers.ps1
```

## Notes

- Development: Vite serves the frontend and static assets; `/api` is proxied to the backend (see client/vite.config.js).
- Production: Express serves the built frontend from `client/dist` and continues serving all APIs under `/api`.
- The API provides heritage data at `/api/data` from server/data.json.
- A legacy static page is still available at `/public/index.html` for backward compatibility.
