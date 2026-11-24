# backend/

Implements [`docs/API.md`](../docs/API.md). Nothing is built here yet.

## Planned stack

- Node.js + Express (REST, JSON), served on port `4000`
- PostgreSQL with Prisma or Drizzle (tables in `docs/REQUIREMENTS.md` §7)
- Server-side sessions in an httpOnly, Secure, SameSite=Lax cookie; argon2 or bcrypt password hashes
- TMDB for movie/series data and PH watch providers; an LLM to re-rank recommendations
- `Asia/Manila` for "today" and ISO (Monday-start) weeks

## How it will run

```bash
cd backend
npm install
npm run db:migrate && npm run db:seed   # creates the two users
npm run dev                             # http://localhost:4000/api
```

The frontend dev server proxies `/api` to `http://localhost:4000`. To use this backend, set
`serviceConfig.mode = 'http'` in `frontend/src/services/config.ts`.

The frontend's mock services (`frontend/src/services/mock/`) follow the same behavior rules
(blind rating, streak, taste match, sorting), so they are a working reference.
