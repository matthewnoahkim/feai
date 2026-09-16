"""FEAI's modeling engine — a FastAPI service wrapping FreeCAD's Part module.

Mirrors the existing fea-solver pattern: a standalone HTTP service the Next.js frontend
calls instead of doing geometry locally. See /THIRD_PARTY_NOTICES.md for FreeCAD
attribution and packages/cad-server/README.md for how to run this.
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import freecad_ops, shape_store
from .freecad_ops import GeometryError
from .schemas import (
    BooleanRequest,
    ChamferRequest,
    ExtrudeRequest,
    FilletRequest,
    LoftRequest,
    MeshImportRequest,
    PrimitiveRequest,
    RevolveRequest,
    ShapeResult,
    SweepRequest,
)

app = FastAPI(title="FEAI Modeling Engine")

# Comma-separated browser origins allowed to call this service. Defaults to "*" so local
# dev needs no setup; production (render.yaml) sets it to the real frontend origin.
_allowed_origins = [o.strip() for o in os.environ.get("CAD_ALLOWED_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run(build_shape, edge_points: int = 16) -> ShapeResult:
    try:
        shape = build_shape()
    except GeometryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if shape is None or shape.isNull():
        raise HTTPException(status_code=400, detail="Operation produced an empty shape")
    return freecad_ops.shape_to_result(shape, edge_points=edge_points)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/primitives", response_model=ShapeResult)
def primitives(req: PrimitiveRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.make_primitive(req))


@app.post("/extrude", response_model=ShapeResult)
def extrude(req: ExtrudeRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_extrude(req))


@app.post("/revolve", response_model=ShapeResult)
def revolve(req: RevolveRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_revolve(req))


@app.post("/sweep", response_model=ShapeResult)
def sweep(req: SweepRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_sweep(req))


@app.post("/loft", response_model=ShapeResult)
def loft(req: LoftRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_loft(req))


@app.post("/boolean", response_model=ShapeResult)
def boolean(req: BooleanRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_boolean(req))


@app.post("/fillet", response_model=ShapeResult)
def fillet(req: FilletRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_fillet(req))


@app.post("/chamfer", response_model=ShapeResult)
def chamfer(req: ChamferRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_chamfer(req))


@app.post("/import/mesh", response_model=ShapeResult)
def import_mesh(req: MeshImportRequest) -> ShapeResult:
    # A mesh-derived solid has one straight edge per triangle edge, so 2 points each
    # keeps the edge payload from exploding on large STLs.
    return _run(lambda: freecad_ops.do_import_mesh(req), edge_points=2)


@app.delete("/shapes/{shape_id}")
def delete_shape(shape_id: str) -> dict[str, str]:
    shape_store.delete(shape_id)
    return {"status": "deleted"}
