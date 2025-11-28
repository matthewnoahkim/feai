# feai

AI-assisted and web-based CAD/Finite Element software

**[Launch feai](https://feai.vercel.app)**

## Features

- **Sketching** — Lines, arcs, circles, rectangles, splines with geometric constraints and dimensions
- **Solid Modeling** — Extrude, revolve, sweep, loft, fillet, chamfer, shell, boolean operations
- **Direct Editing** — Push-pull face manipulation without history
- **Patterns** — Linear, circular, and mirror patterns
- **Assembly** — Component mates (fastened, revolute, slider, planar) with interference detection
- **Drawings** — Orthographic views, dimensions, GD&T annotations
- **Import/Export** — STEP, STL, OBJ, DXF formats
- **Analysis** — Mass properties, draft analysis, interference checking
- **AI Assistant** — Natural language CAD commands

## Quick Start

```bash
git clone https://github.com/matthewnoahkim/feai.git
cd feai
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Three.js, Tailwind CSS |
| Backend | Node.js, Express |
| State | Zustand |
| Build | Vite |

## License

MIT License — see [LICENSE](LICENSE)
