"""FEAI's modeling engine — a FastAPI service wrapping FreeCAD's Part module.

Mirrors the existing fea-solver pattern: a standalone HTTP service the Next.js frontend
calls instead of doing geometry locally. See /THIRD_PARTY_NOTICES.md for FreeCAD
attribution and packages/cad-server/README.md for how to run this.
"""

import os

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from . import freecad_ops, shape_store
from .freecad_ops import GeometryError
from .schemas import (
    BooleanRequest,
    ChamferRequest,
    CircularPatternRequest,
    ExportRequest,
    ExtrudeRequest,
    FilletRequest,
    LinearPatternRequest,
    LoftRequest,
    MeshImportRequest,
    MirrorRequest,
    PrimitiveRequest,
    RevolveRequest,
    ShapeResult,
    ShellRequest,
    StepImportRequest,
    SweepRequest,
    TessellateRequest,
)

_EXPORT_MEDIA_TYPE = {
    "step": "application/step",
    "iges": "model/iges",
    "brep": "application/octet-stream",
}

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


def _run(build_shape, edge_points: int = 16, tolerance: float = 0.5) -> ShapeResult:
    try:
        shape = build_shape()
    except GeometryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if shape is None or shape.isNull():
        raise HTTPException(status_code=400, detail="Operation produced an empty shape")
    return freecad_ops.shape_to_result(shape, edge_points=edge_points, tolerance=tolerance)


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


@app.post("/pattern/linear", response_model=ShapeResult)
def pattern_linear(req: LinearPatternRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_linear_pattern(req))


@app.post("/pattern/circular", response_model=ShapeResult)
def pattern_circular(req: CircularPatternRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_circular_pattern(req))


@app.post("/mirror", response_model=ShapeResult)
def mirror(req: MirrorRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_mirror(req))


@app.post("/shell", response_model=ShapeResult)
def shell(req: ShellRequest) -> ShapeResult:
    return _run(lambda: freecad_ops.do_shell(req))


@app.post("/import/mesh", response_model=ShapeResult)
def import_mesh(req: MeshImportRequest) -> ShapeResult:
    # A mesh-derived solid has one straight edge per triangle edge, so 2 points each
    # keeps the edge payload from exploding on large STLs.
    return _run(lambda: freecad_ops.do_import_mesh(req), edge_points=2)


@app.post("/import/step", response_model=list[ShapeResult])
def import_step(req: StepImportRequest) -> list[ShapeResult]:
    # A real deviation from _run()'s one-shape-in-one-shape-out contract: a STEP/IGES
    # file can contain multiple independent solids, so this returns one ShapeResult per
    # top-level solid instead of routing through _run().
    try:
        solids = freecad_ops.do_import_step(req)
    except GeometryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        # The first endpoint parsing an arbitrary externally-authored file — anything
        # unexpected from FreeCAD/OCC's parser is a bad file, not a server bug, so it's
        # reported as 400 here rather than escaping as a bare 500 the way _run() still
        # would for other ops (see do_import_step's docstring for why this endpoint
        # specifically gets the broader net).
        raise HTTPException(status_code=400, detail=f"Could not import file: {exc}") from exc
    return [freecad_ops.shape_to_result(s) for s in solids]


@app.post("/export")
def export_shape(req: ExportRequest) -> Response:
    try:
        data, filename = freecad_ops.do_export(req)
    except GeometryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Export failed: {exc}") from exc
    return Response(
        content=data,
        media_type=_EXPORT_MEDIA_TYPE.get(req.format, "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/shapes/{shape_id}/tessellate", response_model=ShapeResult)
def tessellate_shape(shape_id: str, req: TessellateRequest) -> ShapeResult:
    # Same geometry under a fresh shapeId, meshed at the requested coarseness (LOD).
    return _run(lambda: shape_store.get(shape_id), edge_points=req.edgePoints, tolerance=req.tolerance)


@app.delete("/shapes/{shape_id}")
def delete_shape(shape_id: str) -> dict[str, str]:
    shape_store.delete(shape_id)
    return {"status": "deleted"}
