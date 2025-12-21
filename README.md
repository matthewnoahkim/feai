# FeAI - Professional 3D CAD Powered by AI

AI-assisted Finite Element Analysis software with integrated CAD modeling, structural analysis, and real-time collaboration.

## Architecture

**Unified Server Setup** - Single Express server serving both frontend and API:
- Frontend: React + Vite (built and served as static files)
- Backend: Express.js REST API + Google OAuth
- Database: PostgreSQL (Neon.tech) via Prisma ORM
- FEA Solver: CalculiX (WebAssembly)

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
│  REST API                            │
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

**FEA:**
- CalculiX (WebAssembly)
- Custom mesh generator
- Structural analysis engine

## 📝 License

MIT License - Open source under MIT license.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.
