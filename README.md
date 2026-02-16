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
│   ├── shared/                   # Shared TypeScript types (document, fea, geometry, etc.)
│   ├── kernel/                   # CAD kernel (modeling, sketch, fea, io, geometry, math)
│   ├── frontend/                 # Next.js app (Vercel / standalone)
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router (routes, layouts, api/)
│   │   │   ├── components/       # UI (dialogs/, chat/, fea/, editor/, landing/)
│   │   │   ├── api/              # API client for backend + barrel (index)
│   │   │   ├── lib/              # Auth (config, helpers), prisma, fea-solver
│   │   │   ├── store/            # Zustand (document, project, fea, chat, schematic, ui, workflow)
│   │   │   ├── services/          # chatService, cadExecutor
│   │   │   ├── hooks/            # useChatAssistant
│   │   │   ├── utils/            # measurement-utils, fea-utils
│   │   │   ├── styles/           # globals.css
│   │   │   └── types/            # next-auth.d.ts
│   │   └── prisma/               # Schema (when frontend owns DB)
│   └── backend/                  # Express server (optional; FEA mesh also in Next.js api/)
│       └── src/
│           ├── routes/           # documents, parts, sketches, fea, analysis, etc.
│           ├── db/               # DB access
│           └── store.ts          # In-memory store
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

**Root Directory must be `packages/frontend`** for OAuth (and all Next.js API routes) to work. When Root Directory is the repo root, Vercel treats the repo root as the app root; your Next.js app and its `/api/auth/*` routes live in `packages/frontend`, so those routes are not registered and return 404. With Root Directory = `packages/frontend`, the deployment root is the Next.js app, so `/api/auth/callback/google` and other API routes are served correctly.

The repo is set up so the build still has access to workspace packages (`@feai/shared`, `@feai/kernel`):

- **vercel.json**: `installCommand: "cd ../.. && npm install"` (install from repo root), `buildCommand: "npm run build"`, `outputDirectory: ".next"`.
- **packages/frontend/package.json**: `"build": "cd ../.. && npm run build"` so when Vercel runs `npm run build` from `packages/frontend`, it runs the full monorepo build (shared → kernel → frontend). The root uses `build:next` for the frontend step to avoid a build loop.

In Vercel: set **Root Directory** to `packages/frontend`. Do not override Build/Install Command. Set env vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`. In Google Cloud Console, add **Authorized redirect URI**: `https://yourdomain.com/api/auth/callback/google`.

## License

MIT License - Open source under MIT license.

## Contributing

Contributions welcome! Please contact finite.element.ai@gmail.com.
