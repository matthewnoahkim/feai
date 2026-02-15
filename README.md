# FEAI - Professional 3D CAD Powered by AI

AI-assisted CAD software with integrated modeling, analysis, and real-time collaboration.

## Architecture

**Unified Server Setup** - Single Express server serving both frontend and API:
- Frontend: React + Vite (built and served as static files)
- Backend: Express.js REST API + Google OAuth
- Database: PostgreSQL (Neon.tech) via Prisma ORM

```
┌─────────────────────────────────────┐
│   Unified Server (Port 3001)        │
├─────────────────────────────────────┤
│  Static Frontend (React/Vite)       │
│  ├─ / (Home Page)                   │
│  ├─ /login (Authentication)         │
│  ├─ /dashboard (Projects)           │
│  └─ /editor (CAD + FEA)             │
├─────────────────────────────────────┤
│  REST API                           │
│  ├─ /api/projects                   │
│  ├─ /api/documents                  │
│  ├─ /api/fea                        │
│  └─ /auth/google (OAuth)            │
├─────────────────────────────────────┤
│  Database (Prisma + PostgreSQL)     │
└─────────────────────────────────────┘
```

## Project Structure

```
feai/
├── .env                          # Environment variables (root)
├── package.json                  # Root workspace config
├── packages/
│   ├── shared/                   # Shared TypeScript types
│   ├── kernel/                   # CAD kernel logic
│   ├── frontend/                 # React application
│   │   ├── src/
│   │   │   ├── pages/           # Route pages
│   │   │   ├── components/      # Reusable components
│   │   │   ├── store/           # Zustand state management
│   │   │   └── App.tsx          # Main app component
│   │   └── dist/                # Built frontend (served by backend)
│   └── backend/                  # Express server
│       ├── src/
│       │   ├── routes/          # API routes
│       │   ├── db/              # Prisma client
│       │   └── index.ts         # Server entry point
│       └── prisma/
│           └── schema.prisma    # Database schema
```

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Three.js (@react-three/fiber)
- Zustand (state management)
- React Router

**Backend:**
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Google OAuth 2.0
- JWT authentication

## Deploying to Vercel (monorepo)

1. **Root Directory:** Either leave empty (repo root) so the root build runs and outputs to `packages/frontend/.next`, or set **Root Directory** to `packages/frontend` so Next.js API routes (including `/api/auth/...`) are deployed correctly. If `/api/auth/signin` 404s in production, use Root Directory = `packages/frontend`.
2. **Env vars (production):** Set `NEXTAUTH_URL=https://feai.app` (not localhost), `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`.
3. **Google OAuth:** In Google Cloud Console → Credentials → OAuth 2.0 Client → **Authorized redirect URIs**, add exactly `https://feai.app/api/auth/callback/google` (HTTPS, no trailing slash, no www unless you use it).

**Full OAuth checklist and 404 troubleshooting:** see [DEPLOY.md](./DEPLOY.md).

## License

MIT License - Open source under MIT license.

## Contributing

Contributions welcome! Please contact finite.element.ai@gmail.com.
