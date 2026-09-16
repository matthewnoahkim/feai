# FEAI Modeling Engine (`cad-server`)

A FastAPI service that does FEAI's real solid modeling — primitives, extrude, revolve,
sweep, loft, boolean ops, fillet/chamfer — via [FreeCAD](https://github.com/FreeCAD/FreeCAD)'s
Python API (`Part` module). Not user-facing as "FreeCAD" — the product calls this
"FEAI's modeling engine." See `/THIRD_PARTY_NOTICES.md` at the repo root for the
required (and accurate) attribution.

It's a separately-hosted service, not part of the Vercel deployment — same pattern as
the existing FEA solver (`packages/frontend/src/lib/fea-solver`).

## Why conda-forge, not the vendored `third_party/freecad` source

Compiling FreeCAD's own C++ tree (Qt, OpenCASCADE, Coin3D, Boost, SWIG, …) is a
multi-hour build even in FreeCAD's own CI. This service installs the prebuilt
conda-forge `freecad` package instead, which ships the same Python API
(`import FreeCAD, Part`) without building anything. The vendored submodule stays
around for reference/patching, not as this service's build input.

## Run locally

Requires either Docker, or conda/mamba installed directly.

**Docker (recommended):**
```
docker build -t feai-cad-server .
docker run -p 8000:8000 feai-cad-server
```

**Conda/mamba directly:**
```
mamba env create -f environment.yml
mamba run -n feai-cad-server uvicorn app.main:app --reload --port 8000
```

Then point the frontend at it:
```
NEXT_PUBLIC_CAD_API_URL=http://localhost:8000
```

## Smoke test

With the server running:
```
python smoketest.py            # defaults to http://localhost:8000
python smoketest.py http://host:port
```
It exercises every endpoint against real FreeCAD and checks the results against
closed-form expectations (box/cylinder/sphere/cone volumes, torus from a revolve,
all three booleans, fillet vs. chamfer, and the 404/400 error paths). Expect `ALL PASSED`.

## Deploy to Render

`/render.yaml` at the repo root is a Render Blueprint for this service. In the Render
dashboard: **New → Blueprint**, pick this repo, apply. It provisions a Docker web service
(`plan: standard`, single instance, health check on `/health`) built from
`packages/cad-server`.

After the first deploy:
1. In Render, set the `CAD_ALLOWED_ORIGINS` env var to the frontend's origin
   (e.g. `https://feai.app`). It's `sync: false` in the blueprint, so it's never committed.
2. In Vercel, set `NEXT_PUBLIC_CAD_API_URL` to the URL Render assigns
   (`https://feai-cad-server.onrender.com` or similar) and redeploy the frontend.

Notes:
- Keep `numInstances: 1` — shapeIds are process-local (see `shape_store.py`).
- Render clones git submodules, so every build also fetches `third_party/freecad`. The
  Docker build doesn't use it, but it adds clone time. If that gets painful the submodule
  can move elsewhere — `/THIRD_PARTY_NOTICES.md` is what the license actually requires,
  not the vendored copy.
- The Dockerfile honors Render's injected `PORT` (defaults to 8000 locally).

## Gotchas found the hard way

- **`FreeCAD.so`/`Part.so` are not on Python's default path.** The conda-forge package
  puts them in the env's `lib/` directly, not `lib/python3.11/site-packages/`, so
  `import FreeCAD` fails unless `PYTHONPATH` includes that `lib/` dir. The Dockerfile
  sets it; if you run outside Docker, set it yourself.
- **Booleans return a `Part.Compound`, not a `Solid`,** even for a single-body result.
  `Compound` lacks `CenterOfMass`/`PrincipalProperties` and `makeFillet` wants a Solid, so
  `freecad_ops._normalize` unwraps single-solid compounds before storing. Multi-solid
  results (a cut that splits a body) stay a Compound and get volume-weighted mass
  properties with inertia zeroed — see `mass_properties`.
- **Running in WSL2 without Docker Desktop:** WSL shuts the VM down when no session holds
  it open, which kills `dockerd` and every container with it (they exit 255 with no
  traceback). Keep a session alive (`wsl -d Ubuntu -- sleep infinity` in the background)
  or set `vmIdleTimeout=-1` in `%USERPROFILE%\.wslconfig`.

## API

One endpoint per operation, all returning `{ shapeId, mesh, edges, massProperties }`:

- `POST /primitives` — `{ type: "box"|"cylinder"|"sphere"|"cone", params }`
- `POST /extrude` — `{ profile, plane, params }`
- `POST /revolve` — `{ profile, plane, axisPoint, axisDirection, params }`
- `POST /sweep` — `{ profile, profilePlane, path, pathPlane, params }`
- `POST /loft` — `{ profiles: [{ profile, plane }, ...], params }`
- `POST /boolean` — `{ op: "union"|"cut"|"intersect", baseShapeId, toolShapeId }`
- `POST /fillet` — `{ shapeId, edgeIndices, radius }` (empty `edgeIndices` = all edges)
- `POST /chamfer` — `{ shapeId, edgeIndices, distance }` (empty `edgeIndices` = all edges)
- `POST /import/mesh` — `{ positions, indices, tolerance? }` — turn a triangle mesh (e.g. a
  parsed STL) into a real solid with a `shapeId`, so booleans/fillets work on imports
- `DELETE /shapes/{shapeId}` — release a shape from the in-memory store
- `GET /health`

`shapeId`s are process-local (in-memory `shape_store`) — they don't survive a restart,
and a multi-instance deployment would need sticky sessions or a shared store. Fine for
a single dev/staging instance; a real production deployment is follow-up work.

See `app/schemas.py` for exact request/response shapes, and `app/freecad_ops.py` for
the profile conventions (rectangle/circle/polygon, matching `documentStore.ts`'s
`SketchEntity` data shapes) and the operations themselves.
