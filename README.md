# Do You Want to Watch a Movie?

A private movie and series diary for exactly two people: log what you watched, rate it
(blind until you both have), keep a shared watchlist, keep a weekly streak going and get
picks tuned to both of your tastes. The look is "Retro Minihome": a ring binder on grid
paper with pixel fonts.

## Folders

| Folder | What's in it |
| --- | --- |
| `frontend/` | The React + Vite + TypeScript app. Runs fully on mock services until the backend exists. |
| `backend/` | Placeholder for the Express + Postgres API. It must implement `docs/API.md`. |
| `docs/` | `DESIGN.md` (look and layout), `REQUIREMENTS.md` (R1–R16, S1–S12), `API.md` (the REST contract shared by both sides), `FRONTEND_PROMPT.md` (the frontend build brief). |

## Run the frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 — mock data, no backend needed
```

Sign in as `alex` or `sam` (password `movienight2026`). See `frontend/README.md` for the
services layer and how to switch to the real backend.
