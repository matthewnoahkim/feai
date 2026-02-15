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

1. Keep **Root Directory** empty (repo root). Build runs from root and outputs to `packages/frontend/.next`.
2. Set env vars: `NEXTAUTH_URL` (e.g. `https://feai.app`), `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`.
3. In Google Cloud Console (APIs & Services → Credentials → your OAuth 2.0 Client), set **Authorized redirect URI** to `{NEXTAUTH_URL}/api/auth/callback/google` (e.g. `https://feai.app/api/auth/callback/google` or `http://localhost:3000/api/auth/callback/google` for local).

## License

MIT License - Open source under MIT license.

## Contributing

Contributions welcome! Please contact finite.element.ai@gmail.com.
