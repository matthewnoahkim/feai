# FEAI - Finite Element Analysis Intelligence

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
│   ├── cad-server/                # FEAI's modeling engine (Python/FastAPI, built on FreeCAD's Part module)
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

## Modeling engine

`packages/cad-server` does FEAI's real solid modeling (primitives, extrude, revolve,
sweep, loft, boolean ops, fillet/chamfer) via FreeCAD's Python API. Like the FEA
solver above, it's a standalone service the frontend calls over HTTP
(`NEXT_PUBLIC_CAD_API_URL`, default `http://localhost:8000`) — not part of the Vercel
deployment. See `packages/cad-server/README.md` for how to run it, and
`/THIRD_PARTY_NOTICES.md` for required attribution (FreeCAD is LGPL2.1+/GPL2+ — not
shown as "FreeCAD" in the product UI, but the license requires the notice to exist and
be accurate). FreeCAD itself is vendored at `third_party/freecad` for reference; the
service actually runs the prebuilt conda-forge package, not a from-source build of that
checkout — see `third_party/freecad/README-VENDOR.md`.

## .feai project export/import

Projects can be exported as encrypted `.feai` files and re-imported on the same or another account.

**Required environment variables** (for export/import to work):

- `FEAI_EXPORT_SECRET` – Server secret for key derivation (min 32 characters). Used with HKDF-SHA256 + `user_id` to derive the AES-256 key.
- `FEAI_SIGNING_PRIVATE_KEY` – Ed25519 private key (base64, PKCS8 DER).
- `FEAI_SIGNING_PUBLIC_KEY` – Ed25519 public key (base64, SPKI DER).

Generate a signing key pair: use `generateSigningKeyPair()` from `@/lib/feai` (e.g. in a one-off script or Node REPL with ts-node). It returns `{ privateKeyBase64, publicKeyBase64 }`; set those in `.env` as `FEAI_SIGNING_PRIVATE_KEY` and `FEAI_SIGNING_PUBLIC_KEY`.

**Endpoints:**

- `GET /api/projects/:id/export` – Download project as `application/x-feai` (encrypted, signed).
- `POST /api/projects/import` – Upload a `.feai` file (multipart form field `file`); returns the new project and redirect to it.

**Format:** `.feai` = AES-256-GCM encrypted ZIP (IV + ciphertext + auth tag). ZIP contains `manifest.json`, `geometry.json`, `model/architecture.json`, `model/weights.bin`, `dataset.json`, `simulation.json`, `metadata.json`, and `signature.sig` (Ed25519 over SHA-256 of ZIP before adding signature).

## Deploying to Vercel (monorepo)

**Root Directory must be `packages/frontend`** for OAuth (and all Next.js API routes) to work. When Root Directory is the repo root, Vercel treats the repo root as the app root; your Next.js app and its `/api/auth/*` routes live in `packages/frontend`, so those routes are not registered and return 404. With Root Directory = `packages/frontend`, the deployment root is the Next.js app, so `/api/auth/callback/google` and other API routes are served correctly.

The repo is set up so the build still has access to workspace packages (`@feai/shared`):

- **vercel.json**: `installCommand: "cd ../.. && npm install"` (install from repo root), `buildCommand: "npm run build"`, `outputDirectory: ".next"`.
- **packages/frontend/package.json**: `"build": "cd ../.. && npm run build"` so when Vercel runs `npm run build` from `packages/frontend`, it runs the full monorepo build (shared → frontend). The root uses `build:next` for the frontend step to avoid a build loop.
- **packages/cad-server** is Python, not part of this npm build — it's deployed separately (see "Modeling engine" above), and needs `NEXT_PUBLIC_CAD_API_URL` set wherever it's hosted.

In Vercel: set **Root Directory** to `packages/frontend`. Do not override Build/Install Command. Set env vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`. In Google Cloud Console, add **Authorized redirect URI**: `https://yourdomain.com/api/auth/callback/google`.

## License

MIT License - Open source under MIT license.

## Contributing

Contributions welcome! Please contact matthew@feai.app.
