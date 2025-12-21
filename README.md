# FeAI - Professional 3D CAD Powered by AI

AI-assisted Finite Element Analysis software with integrated CAD modeling, structural analysis, and real-time collaboration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client and push schema to database
npm run db:generate
npm run db:push

# Start the unified server (builds frontend + starts backend)
npm run dev
```

The application will be available at **`http://localhost:3001`**

## 🏗️ Architecture

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

## 📁 Project Structure

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

## 🔧 Environment Variables

Create `.env` in the root directory:

```env
# Database (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-random-string-here"

# OpenAI API Key (for AI chat)
VITE_OPENAI_API_KEY="sk-..."

# Server Config
PORT=3001
NODE_ENV=development
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Build frontend + start development server |
| `npm run build` | Build frontend and backend for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run clean` | Clean all build artifacts |

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
5. Copy Client ID and Secret to `.env`

## 🗄️ Database Setup

1. Create a [Neon.tech](https://neon.tech/) account
2. Create a new PostgreSQL database
3. Copy the connection strings to `.env`:
   - `DATABASE_URL` - Pooled connection (for queries)
   - `DIRECT_URL` - Direct connection (for migrations)
4. Run migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

## 🎨 Tech Stack

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
