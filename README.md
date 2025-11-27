# WebCAD - Web-Based CAD Software

A professional-grade, web-based Computer-Aided Design (CAD) system, featuring parametric solid modeling, assembly design, technical drawings, and a comprehensive REST API.

## Features

### Sketching System (2D CAD)
- **Primitives**: Lines, circles, arcs, rectangles, splines, ellipses, construction geometry
- **Geometric Constraints**: Coincident, parallel, perpendicular, tangent, equal, horizontal, vertical, concentric
- **Dimensions**: Driving and driven dimensions with real-time feedback
- **Edit Tools**: Trim, extend, offset, mirror, pattern (linear/circular)

### Parametric Solid Modeling
- **Feature-Based Modeling**: History-driven parametric design
- **Features**: Extrude, Revolve, Sweep, Loft, Fillet, Chamfer, Shell, Draft, Rib
- **Patterns**: Linear pattern, circular pattern, mirror
- **Booleans**: Union, subtract, intersect

### Surface Modeling
- **NURBS Surfaces**: Full NURBS curve and surface support
- **Creation**: Extrude, revolve, loft, sweep, offset surfaces
- **Operations**: Trim, extend, blend, patch, stitch
- **Freeform**: T-Splines/Sub-D modeling support

### Direct Modeling
- **Push-Pull Editing**: Direct face manipulation without history
- **Operations**: Move face, offset face, rotate face, delete face
- **Feature Recognition**: Automatic feature detection on imported geometry

### Assembly System
- **Mate Types**: Fastened, Revolute, Slider, Cylindrical, Planar, Ball, Parallel, Tangent
- **Relations**: Gear, Rack and Pinion, Lead Screw
- **Analysis**: Interference detection, clearance checking
- **Visualization**: Exploded views with animation

### Technical Drawings
- **Views**: Orthographic projection, section views, auxiliary views, detail views
- **Dimensions**: Linear, angular, radial, diameter, ordinate, chain, baseline
- **GD&T**: Full ASME Y14.5 / ISO 1101 support
- **Annotations**: Hole callouts, surface finish, notes, BOM, balloons

### Import/Export
- **STEP** (ISO 10303): Full B-rep import/export
- **IGES**: Legacy CAD data exchange
- **STL**: 3D printing mesh format
- **OBJ**: Wavefront mesh format
- **DXF/DWG**: 2D drawing exchange

### Analysis Tools
- **Mass Properties**: Volume, surface area, mass, center of gravity, moments of inertia
- **Draft Analysis**: Moldability analysis with color-coded visualization
- **Interference**: Assembly collision detection
- **Measurement**: Distance, angle, clearance measurement

## 🏗 Architecture

```
webcad/
├── packages/
│   ├── shared/          # Shared TypeScript types and interfaces
│   ├── kernel/          # Geometry kernel (math, B-rep, modeling operations)
│   ├── backend/         # Node.js REST API server
│   └── frontend/        # React + Three.js web application
└── package.json         # Monorepo configuration
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Three.js, @react-three/fiber, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Geometry Kernel | TypeScript (WebAssembly-ready architecture) |
| State Management | Zustand |
| Build Tool | Vite |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/webcad/webcad.git
cd webcad

# Install dependencies
npm install

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Building for Production

```bash
npm run build
```

## REST API

The WebCAD REST API provides programmatic access to all CAD operations.

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents` | List all documents |
| POST | `/documents` | Create new document |
| GET | `/documents/:id` | Get document details |
| PUT | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Delete document |

#### Part Studios
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/:docId/partstudios/:psId` | Get part studio |
| GET | `/documents/:docId/partstudios/:psId/features` | List features |
| POST | `/documents/:docId/partstudios/:psId/features` | Add feature |
| PUT | `/documents/:docId/partstudios/:psId/features/:fId` | Update feature |
| DELETE | `/documents/:docId/partstudios/:psId/features/:fId` | Delete feature |

#### Sketches
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/:docId/partstudios/:psId/sketches` | Create sketch |
| GET | `/documents/:docId/partstudios/:psId/sketches/:skId` | Get sketch |
| POST | `/documents/:docId/partstudios/:psId/sketches/:skId/entities` | Add entities |
| POST | `/documents/:docId/partstudios/:psId/sketches/:skId/constraints` | Add constraints |

#### Assemblies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/:docId/assemblies/:asmId` | Get assembly |
| POST | `/documents/:docId/assemblies/:asmId/instances` | Add instance |
| POST | `/documents/:docId/assemblies/:asmId/mates` | Add mate |
| GET | `/documents/:docId/assemblies/:asmId/interference` | Check interference |

#### Drawings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/:docId/drawings/:dwgId` | Get drawing |
| POST | `/documents/:docId/drawings/:dwgId/views` | Add view |
| POST | `/documents/:docId/drawings/:dwgId/dimensions` | Add dimension |

#### Export/Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/:docId/partstudios/:psId/export?format=step` | Export part |
| POST | `/documents/:docId/import` | Import file |

#### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/:docId/partstudios/:psId/massproperties` | Mass properties |
| GET | `/documents/:docId/assemblies/:asmId/interference` | Interference check |

### Example API Usage

```javascript
// Create a new document
const response = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My Part', description: 'A simple bracket' })
});
const { data } = await response.json();

// Add an extrude feature
await fetch(`/api/documents/${docId}/partstudios/${psId}/features`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feature: {
      type: 'extrude',
      name: 'Extrude 1',
      parameters: {
        profiles: ['sketch1'],
        depth: 25,
        direction: 'one',
        operation: 'new'
      }
    }
  })
});

// Export to STEP
const exportResponse = await fetch(
  `/api/documents/${docId}/partstudios/${psId}/export?format=step`
);
const stepFile = await exportResponse.blob();
```

## UI Components

The frontend provides a professional CAD interface with:

- **Toolbar**: Mode-specific tools (sketch/model/assembly)
- **Feature Tree**: Hierarchical view of model structure
- **3D Viewport**: Interactive Three.js viewer with orbit controls
- **Property Panel**: Context-sensitive properties and parameters
- **Status Bar**: Mode, selection, and system status

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Exit current tool/mode |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save |
| `F` | Fit view to selection |
| `H` | Home view |
| `W` | Toggle wireframe |
| `G` | Toggle grid |

## Development

### Project Structure

```
packages/
├── shared/src/
│   ├── geometry.ts      # 3D geometry types
│   ├── sketch.ts        # Sketch entity types
│   ├── features.ts      # Feature definitions
│   ├── assembly.ts      # Assembly types
│   ├── drawing.ts       # Drawing types
│   └── api.ts           # API request/response types
├── kernel/src/
│   ├── math/            # Vector, matrix, quaternion, NURBS
│   ├── geometry/        # Curves, surfaces, B-rep
│   ├── sketch/          # Constraint solver, entities
│   ├── modeling/        # Extrude, revolve, fillet, etc.
│   ├── assembly/        # Mate solver, exploded views
│   ├── drawing/         # Projection, dimensioning, GD&T
│   ├── analysis/        # Mass properties, interference
│   └── io/              # STEP, STL, OBJ, DXF
├── backend/src/
│   ├── routes/          # API route handlers
│   ├── store.ts         # In-memory data store
│   └── index.ts         # Express server
└── frontend/src/
    ├── components/      # React components
    ├── store.ts         # Zustand state management
    └── App.tsx          # Main application
```

### Running Tests

```bash
npm test
```

### Code Style

The project uses TypeScript strict mode and follows standard ESLint/Prettier configuration.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## References

- [NURBS Book](https://www.springer.com/gp/book/9783642973857) - The NURBS Book by Piegl & Tiller
- [Open CASCADE](https://www.opencascade.com/) - B-rep modeling concepts
- [ASME Y14.5](https://www.asme.org/codes-standards) - GD&T standard
- [ISO 10303 (STEP)](https://www.iso.org/standard/72237.html) - STEP file format

