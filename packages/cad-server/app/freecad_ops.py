"""FreeCAD-backed modeling operations.

Thin wrappers over FreeCAD's Part module: build a 2D profile (rectangle/circle/polygon,
in the same corner1/corner2 | start/end | center/corner | center+radius conventions
documentStore.ts already uses), then extrude/revolve/sweep/loft it into a real solid,
or combine/modify existing solids (boolean, fillet, chamfer). Every op ends by
tessellating the result and registering it in shape_store so later requests (a boolean
against this body, a fillet on its edges) can reference it by shapeId.
"""

import base64
import math
import os
import tempfile
import threading
from typing import Any

import FreeCAD
import Mesh
import Part
from FreeCAD import Matrix, Placement, Vector

from . import shape_store
from .schemas import (
    BooleanRequest,
    BoundaryFaceGroup,
    ChamferRequest,
    CircularPatternRequest,
    DirectEditRequest,
    EdgePolyline,
    ExportRequest,
    ExtrudeRequest,
    FaceInfo,
    FilletRequest,
    LinearPatternRequest,
    LoftRequest,
    MassProperties,
    MeshData,
    MeshImportRequest,
    MirrorRequest,
    Plane,
    PathEntity,
    PrimitiveRequest,
    ProfileEntity,
    RevolveRequest,
    ShapeResult,
    ShellRequest,
    StepImportRequest,
    SweepRequest,
    TetMeshElement,
    TetMeshNode,
    TetMeshResult,
    TetrahedralMeshRequest,
    VertexInfo,
)


class GeometryError(ValueError):
    """A geometry operation failed for a reason the caller can act on (bad params, degenerate shape)."""


# ============================================================================
# Placement
# ============================================================================


def plane_placement(plane: Plane) -> Placement:
    """Builds a world Placement from a sketch plane {origin, normal, xAxis}."""
    origin = Vector(*plane.origin)
    normal = Vector(*plane.normal)
    if normal.Length < 1e-9:
        normal = Vector(0, 0, 1)
    normal.normalize()

    x_axis = Vector(*plane.xAxis)
    x_axis = x_axis - normal * x_axis.dot(normal)
    if x_axis.Length < 1e-9:
        arbitrary = Vector(1, 0, 0) if abs(normal.x) < 0.9 else Vector(0, 1, 0)
        x_axis = arbitrary - normal * arbitrary.dot(normal)
    x_axis.normalize()

    y_axis = normal.cross(x_axis)

    matrix = Matrix(
        x_axis.x, y_axis.x, normal.x, origin.x,
        x_axis.y, y_axis.y, normal.y, origin.y,
        x_axis.z, y_axis.z, normal.z, origin.z,
        0, 0, 0, 1,
    )
    return Placement(matrix)


# ============================================================================
# Profile / path construction (local 2D coords, z=0)
# ============================================================================


def _rectangle_bounds(data: dict[str, Any]) -> tuple[float, float, float, float]:
    if "corner1" in data and "corner2" in data:
        x1, y1 = data["corner1"]["x"], data["corner1"]["y"]
        x2, y2 = data["corner2"]["x"], data["corner2"]["y"]
    elif "start" in data and "end" in data:
        x1, y1 = data["start"]["x"], data["start"]["y"]
        x2, y2 = data["end"]["x"], data["end"]["y"]
    elif "center" in data and "corner" in data:
        cx, cy = data["center"]["x"], data["center"]["y"]
        dx = abs(data["corner"]["x"] - cx)
        dy = abs(data["corner"]["y"] - cy)
        x1, y1, x2, y2 = cx - dx, cy - dy, cx + dx, cy + dy
    else:
        x1, y1, x2, y2 = -15, -15, 15, 15
    return min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)


def _circle_params(data: dict[str, Any]) -> tuple[float, float, float]:
    center = data.get("center", {})
    return center.get("x", 0.0), center.get("y", 0.0), data.get("radius", 15.0)


def _polygon_params(data: dict[str, Any]) -> tuple[float, float, float, int, bool]:
    center = data.get("center", {})
    return (
        center.get("x", 0.0),
        center.get("y", 0.0),
        data.get("radius", 15.0),
        int(data.get("sides", 6)),
        data.get("inscribed", True),
    )


def _wire_for_profile(profile: ProfileEntity, delta: float = 0.0) -> Part.Wire:
    """Builds a closed wire at z=0. `delta` grows (positive) or shrinks (negative) the
    profile's half-size / radius, used to approximate a draft-angle taper between a
    shape's bottom and top profile in do_extrude."""
    data = profile.data
    if profile.type == "rectangle":
        x1, y1, x2, y2 = _rectangle_bounds(data)
        cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
        hw = max(0.1, (x2 - x1) / 2 + delta)
        hh = max(0.1, (y2 - y1) / 2 + delta)
        pts = [
            Vector(cx - hw, cy - hh, 0), Vector(cx + hw, cy - hh, 0),
            Vector(cx + hw, cy + hh, 0), Vector(cx - hw, cy + hh, 0),
            Vector(cx - hw, cy - hh, 0),
        ]
        return Part.makePolygon(pts)
    if profile.type == "circle":
        cx, cy, radius = _circle_params(data)
        r = max(0.1, radius + delta)
        return Part.Wire([Part.Circle(Vector(cx, cy, 0), Vector(0, 0, 1), r).toShape()])
    if profile.type == "polygon":
        cx, cy, radius, sides, inscribed = _polygon_params(data)
        actual = radius if inscribed else radius * math.cos(math.pi / sides)
        r = max(0.1, actual + delta)
        pts = [
            Vector(cx + r * math.cos(2 * math.pi * i / sides), cy + r * math.sin(2 * math.pi * i / sides), 0)
            for i in range(sides + 1)
        ]
        return Part.makePolygon(pts)
    raise GeometryError(f"Unsupported profile type: {profile.type}")


def _wire_for_path(path: PathEntity) -> Part.Wire:
    """Builds an open wire at z=0 for a sweep path. Straight lines are the common case;
    arcs use {center, radius, startAngle, endAngle (radians), clockwise} as SketchCanvas stores them."""
    data = path.data
    if path.type == "line":
        start = data.get("start", {"x": 0, "y": 0})
        end = data.get("end", {"x": 0, "y": 50})
        edge = Part.makeLine(Vector(start["x"], start["y"], 0), Vector(end["x"], end["y"], 0))
        return Part.Wire([edge])
    if path.type == "arc":
        cx, cy, radius = _circle_params(data)
        # SketchCanvas stores these in radians already; `clockwise` picks which way round.
        start_angle = float(data.get("startAngle", 0.0))
        end_angle = float(data.get("endAngle", math.pi))
        if data.get("clockwise"):
            if end_angle > start_angle:
                end_angle -= 2 * math.pi
        elif end_angle < start_angle:
            end_angle += 2 * math.pi
        mid_angle = (start_angle + end_angle) / 2
        start_pt = Vector(cx + radius * math.cos(start_angle), cy + radius * math.sin(start_angle), 0)
        mid_pt = Vector(cx + radius * math.cos(mid_angle), cy + radius * math.sin(mid_angle), 0)
        end_pt = Vector(cx + radius * math.cos(end_angle), cy + radius * math.sin(end_angle), 0)
        edge = Part.Arc(start_pt, mid_pt, end_pt).toShape()
        return Part.Wire([edge])
    raise GeometryError(f"Unsupported path type: {path.type}")


# ============================================================================
# Primitives
# ============================================================================


def make_primitive(req: PrimitiveRequest) -> Part.Shape:
    p = req.params
    if req.type == "box":
        return Part.makeBox(p.get("width", 30), p.get("depth", 30), p.get("height", 30))
    if req.type == "cylinder":
        return Part.makeCylinder(p.get("radius", 15), p.get("height", 30))
    if req.type == "sphere":
        return Part.makeSphere(p.get("radius", 15))
    if req.type == "cone":
        return Part.makeCone(p.get("radius1", 15), p.get("radius2", 0), p.get("height", 30))
    raise GeometryError(f"Unsupported primitive type: {req.type}")


# ============================================================================
# Feature operations
# ============================================================================


def do_extrude(req: ExtrudeRequest) -> Part.Shape:
    p = req.params
    z_bottom, z_top = 0.0, p.depth1
    if p.endCondition1 == "symmetric":
        z_bottom, z_top = -p.depth1 / 2, p.depth1 / 2
    elif p.flipDirection1:
        z_bottom, z_top = -p.depth1, 0.0

    if p.useSecondDirection and p.endCondition1 != "symmetric":
        if p.flipDirection1:
            z_top = p.depth2
        else:
            z_bottom = -p.depth2

    if p.useDraft and p.draftAngle > 0:
        total_depth = abs(z_top - z_bottom)
        taper = math.tan(math.radians(p.draftAngle)) * total_depth
        delta = taper if p.draftOutward else -taper
        bottom_wire = _wire_for_profile(req.profile, delta=0.0)
        top_wire = _wire_for_profile(req.profile, delta=delta)
        bottom_wire.translate(Vector(0, 0, z_bottom))
        top_wire.translate(Vector(0, 0, z_top))
        solid = Part.makeLoft([bottom_wire, top_wire], True)
    else:
        wire = _wire_for_profile(req.profile)
        face = Part.Face(wire)
        face.translate(Vector(0, 0, z_bottom))
        solid = face.extrude(Vector(0, 0, z_top - z_bottom))

    solid.Placement = plane_placement(req.plane)
    return solid


def do_revolve(req: RevolveRequest) -> Part.Shape:
    wire = _wire_for_profile(req.profile)
    face = Part.Face(wire)
    face.Placement = plane_placement(req.plane)  # profile into world before revolving

    axis_point = Vector(*req.axisPoint)
    axis_dir = Vector(*req.axisDirection)
    if axis_dir.Length < 1e-9:
        raise GeometryError("Revolve axis direction cannot be zero-length")
    axis_dir.normalize()

    p = req.params
    if p.directionType == "symmetric":
        half = p.angle / 2
        solid = face.revolve(axis_point, axis_dir, half).fuse(face.revolve(axis_point, axis_dir, -half))
    else:
        solid = face.revolve(axis_point, axis_dir, p.angle)
        if p.directionType == "one-direction" and p.angle2:
            solid = solid.fuse(face.revolve(axis_point, axis_dir, -p.angle2))
    return solid


def do_sweep(req: SweepRequest) -> Part.Shape:
    profile_wire = _wire_for_profile(req.profile)
    profile_wire.Placement = plane_placement(req.profilePlane)

    path_wire = _wire_for_path(req.path)
    path_wire.Placement = plane_placement(req.pathPlane)

    is_frenet = req.params.orientation == "follow-path"
    solid = path_wire.makePipeShell([profile_wire], True, is_frenet)
    return solid


def do_loft(req: LoftRequest) -> Part.Shape:
    if len(req.profiles) < 2:
        raise GeometryError("Loft needs at least two profiles")
    wires = []
    for lp in req.profiles:
        wire = _wire_for_profile(lp.profile)
        wire.Placement = plane_placement(lp.plane)
        wires.append(wire)
    return Part.makeLoft(wires, True, False, req.params.closedLoft)


def do_boolean(req: BooleanRequest) -> Part.Shape:
    base = shape_store.get(req.baseShapeId)
    tool = shape_store.get(req.toolShapeId)
    if req.op == "union":
        return base.fuse(tool)
    if req.op == "cut":
        return base.cut(tool)
    if req.op == "intersect":
        return base.common(tool)
    raise GeometryError(f"Unsupported boolean op: {req.op}")


def _selected_edges(shape: Part.Shape, edge_indices: list[int]) -> list:
    """Empty edge_indices means every edge — what a user means by "fillet the box" from
    the chat, where the model has no edge ids to give."""
    if not edge_indices:
        edges = list(shape.Edges)
    else:
        edges = [shape.Edges[i] for i in edge_indices if 0 <= i < len(shape.Edges)]
    if not edges:
        raise GeometryError("No valid edge indices provided")
    return edges


def do_fillet(req: FilletRequest) -> Part.Shape:
    shape = shape_store.get(req.shapeId)
    return shape.makeFillet(req.radius, _selected_edges(shape, req.edgeIndices))


def do_chamfer(req: ChamferRequest) -> Part.Shape:
    shape = shape_store.get(req.shapeId)
    return shape.makeChamfer(req.distance, _selected_edges(shape, req.edgeIndices))


def _selected_faces(shape: Part.Shape, face_indices: list[int]) -> list:
    """Unlike _selected_edges, an empty face_indices is NOT shorthand for "all faces" —
    for shell that would mean removing every face (a degenerate, empty result), so empty
    here means "no faces to remove" (a fully enclosed hollow shell) instead."""
    return [shape.Faces[i] for i in face_indices if 0 <= i < len(shape.Faces)]


def _fuse_all(shapes: list) -> Part.Shape:
    result = shapes[0]
    for shape in shapes[1:]:
        result = result.fuse(shape)
    return result


def do_linear_pattern(req: LinearPatternRequest) -> Part.Shape:
    """Repeats the current body along one or two directions and fuses the instances into
    one shape. Scoped to the whole body (like fillet/chamfer's shapeId), not a single
    feature within it — cad-server has no feature-history graph to pattern a sub-feature
    against."""
    shape = shape_store.get(req.shapeId)
    if req.count1 < 1:
        raise GeometryError("Pattern count must be at least 1")

    direction1 = Vector(*req.direction1)
    if direction1.Length < 1e-9:
        raise GeometryError("Pattern direction cannot be zero-length")
    direction1.normalize()

    instances = [shape]
    for i in range(1, req.count1):
        copy = shape.copy()
        copy.translate(direction1 * (req.spacing1 * i))
        instances.append(copy)

    if req.direction2 and req.count2 and req.count2 > 1:
        direction2 = Vector(*req.direction2)
        if direction2.Length > 1e-9:
            direction2.normalize()
            spacing2 = req.spacing2 or 0.0
            for j in range(1, req.count2):
                offset2 = direction2 * (spacing2 * j)
                for base_instance in list(instances):
                    copy = base_instance.copy()
                    copy.translate(offset2)
                    instances.append(copy)

    return _fuse_all(instances)


def do_circular_pattern(req: CircularPatternRequest) -> Part.Shape:
    """Repeats the current body around an axis and fuses the instances. Same whole-body
    scoping as do_linear_pattern."""
    shape = shape_store.get(req.shapeId)
    if req.count < 1:
        raise GeometryError("Pattern count must be at least 1")

    axis_point = Vector(*req.axisPoint)
    axis_dir = Vector(*req.axisDirection)
    if axis_dir.Length < 1e-9:
        raise GeometryError("Pattern axis direction cannot be zero-length")
    axis_dir.normalize()

    angle_step = req.angle / req.count
    instances = [shape]
    for i in range(1, req.count):
        copy = shape.copy()
        copy.rotate(axis_point, axis_dir, angle_step * i)
        instances.append(copy)

    return _fuse_all(instances)


def do_mirror(req: MirrorRequest) -> Part.Shape:
    shape = shape_store.get(req.shapeId)
    plane_origin = Vector(*req.planeOrigin)
    plane_normal = Vector(*req.planeNormal)
    if plane_normal.Length < 1e-9:
        raise GeometryError("Mirror plane normal cannot be zero-length")
    plane_normal.normalize()

    mirrored = shape.mirror(plane_origin, plane_normal)
    if req.merge:
        return shape.fuse(mirrored)
    return mirrored


def do_shell(req: ShellRequest) -> Part.Shape:
    shape = shape_store.get(req.shapeId)
    if req.thickness <= 0:
        raise GeometryError("Shell thickness must be positive")
    faces = _selected_faces(shape, req.faceIndices)
    if not faces:
        # Confirmed against a real FreeCAD 1.1.3 build: shape.makeThickness([], ...) is
        # not a "fully enclosed hollow shell" — it raises ValueError("Null input shape").
        # OCC's BRepOffsetAPI_MakeThickSolid has no zero-opening mode, so this isn't
        # something to work around here; reject it honestly instead of forwarding OCC's
        # cryptic message.
        raise GeometryError("Shell requires at least one face to remove — a fully enclosed hollow shell (no faceIndices) isn't supported")
    try:
        # Negative offset hollows inward (removing material); positive would thicken the
        # shape outward instead, which "shell this body to a wall thickness" never means.
        return shape.makeThickness(faces, -req.thickness, 1e-3)
    except Exception as exc:
        raise GeometryError(f"Shell operation failed: {exc}") from exc


def do_import_mesh(req: MeshImportRequest) -> Part.Shape:
    """Turns a triangle mesh (e.g. a parsed STL) into a real solid, so imported parts get
    a shapeId that later booleans/fillets can use instead of staying a dead mesh."""
    if len(req.positions) % 3 or len(req.indices) % 3:
        raise GeometryError("positions and indices must be flat xyz / triangle triplets")
    points = [Vector(*req.positions[i:i + 3]) for i in range(0, len(req.positions), 3)]
    facets = []
    for i in range(0, len(req.indices), 3):
        try:
            facets.append((points[req.indices[i]], points[req.indices[i + 1]], points[req.indices[i + 2]]))
        except IndexError as exc:
            raise GeometryError("triangle index out of range") from exc
    if not facets:
        raise GeometryError("Mesh has no triangles")

    shape = Part.Shape()
    shape.makeShapeFromMesh(Mesh.Mesh(facets).Topology, req.tolerance)
    solid = Part.makeSolid(shape)
    if solid.isNull():
        raise GeometryError("Mesh is not a closed volume; cannot make a solid")
    if solid.Volume < 0:
        solid.reverse()
    if solid.Volume <= 0:
        raise GeometryError("Mesh is not a closed volume; cannot make a solid")
    return solid


_STEP_IMPORT_SUFFIX = {"step": ".step", "iges": ".iges"}
_EXPORT_SUFFIX = {"step": ".step", "iges": ".iges", "brep": ".brep"}


def do_import_step(req: StepImportRequest) -> list[Part.Shape]:
    """Reads a STEP/IGES file into one or more solids. A file can contain multiple
    independent solids (an "assembly" in the loose sense); since cad-server has no
    assembly concept yet, each top-level solid is returned as its own shape rather than
    kept as a single multi-solid compound — the caller (documentStore.ts) maps this list
    onto N independent parts, same as it would N separately-created bodies.

    This is the first place cad-server parses an arbitrary externally-authored file, so
    failures here are treated as expected/likely, not exceptional — malformed input is
    reported with a clear GeometryError (→ 400) rather than left to escape as a bare 500.
    """
    try:
        raw = base64.b64decode(req.fileContent, validate=True)
    except Exception as exc:
        raise GeometryError(f"fileContent is not valid base64: {exc}") from exc

    suffix = _STEP_IMPORT_SUFFIX.get(req.format, ".step")
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name
        shape = Part.Shape()
        # Part.Shape.read() takes a filesystem path, not raw bytes — hence the temp file
        # round-trip (matches the existing do_export below, and do_import_mesh's
        # in-memory equivalent for a plain triangle mesh, which needs no such file).
        shape.read(tmp_path)
    except GeometryError:
        raise
    except Exception as exc:
        raise GeometryError(f"Could not read {req.format.upper()} file: {exc}") from exc
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    if shape is None or shape.isNull():
        raise GeometryError(f"{req.format.upper()} file contained no usable geometry")
    solids = list(shape.Solids)
    if not solids and shape.Faces:
        # Confirmed against a real FreeCAD 1.1.3 build: IGES specifically (unlike STEP)
        # round-trips as a bare Compound of disconnected Faces (shape.Solids == [],
        # shape.Shells == []) even for a shape that was a genuine solid before export —
        # IGES is historically a surface-exchange format and doesn't carry the same
        # manifold-solid metadata STEP's AP203/214 does. Part.makeSolid() itself requires
        # a Shell or CompSolid input (confirmed: it raises "No shells or compsolids found
        # in shape" on a raw Compound of Faces), so the faces have to be sewn into a
        # Shell first — same two-step heal do_import_mesh's mesh-to-solid path is
        # conceptually doing, just starting from real B-rep faces instead of mesh facets.
        try:
            shell = Part.makeShell(shape.Faces)
            healed = Part.makeSolid(shell)
            if not healed.isNull() and healed.Volume > 0:
                solids = [healed]
        except Exception:
            pass
    if not solids:
        raise GeometryError(
            f"{req.format.upper()} file has no solids — surfaces/wires-only files aren't supported yet"
        )
    return solids


def do_export(req: ExportRequest) -> tuple[bytes, str]:
    """Exports a stored shape to STEP/IGES/BREP bytes, for the caller to hand back to the
    browser as a file download. Same temp-file round-trip as do_import_step, for the same
    reason (FreeCAD's export methods take a path, not returning bytes directly)."""
    shape = shape_store.get(req.shapeId)
    suffix = _EXPORT_SUFFIX.get(req.format, ".step")
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_path = tmp.name
        if req.format == "step":
            shape.exportStep(tmp_path)
        elif req.format == "iges":
            shape.exportIges(tmp_path)
        elif req.format == "brep":
            shape.exportBrep(tmp_path)
        else:
            raise GeometryError(f"Unsupported export format: {req.format}")
        with open(tmp_path, "rb") as f:
            data = f.read()
    except GeometryError:
        raise
    except Exception as exc:
        raise GeometryError(f"Export to {req.format.upper()} failed: {exc}") from exc
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
    return data, f"shape{suffix}"


def do_direct_edit(req: DirectEditRequest) -> Part.Shape:
    """Push/pull a single planar face by a distance, without going back to the sketch
    that (maybe) created it. There is no single "move this face and rebuild adjacent
    faces" primitive in Part/OCC the way there's makeFillet/makeThickness for other
    ops — real push/pull in commercial kernels needs real topological reconstruction.
    The trick that sidesteps that for the common planar case: build a prism by
    extruding the face itself along its own normal by the requested distance, then
    fuse it onto the body (growing) or cut it out (shrinking) — reusing do_extrude's
    and do_boolean's existing primitives instead of any new geometry kernel logic.
    Only works for a planar face; a curved face is rejected with a clear error rather
    than silently producing wrong geometry.
    """
    shape = shape_store.get(req.shapeId)
    if req.distance == 0:
        raise GeometryError("Distance must be non-zero")
    if not (0 <= req.faceIndex < len(shape.Faces)):
        raise GeometryError(f"Face index {req.faceIndex} is out of range (shape has {len(shape.Faces)} faces)")
    face = shape.Faces[req.faceIndex]

    try:
        is_planar = isinstance(face.Surface, Part.Plane)
    except Exception:
        is_planar = False
    if not is_planar:
        raise GeometryError(
            "Direct edit only supports a flat (planar) face right now — this face is curved. "
            "Edit the feature that created it instead."
        )

    try:
        u_min, u_max, v_min, v_max = face.ParameterRange
        normal = face.normalAt((u_min + u_max) / 2, (v_min + v_max) / 2)
    except Exception as exc:
        raise GeometryError(f"Could not compute this face's normal: {exc}") from exc
    if normal.Length < 1e-9:
        raise GeometryError("This face has a degenerate (zero-length) normal")
    normal.normalize()

    try:
        prism = face.extrude(normal * req.distance)
        if req.distance > 0:
            result = shape.fuse(prism)
        else:
            result = shape.cut(prism)
    except Exception as exc:
        raise GeometryError(f"Direct edit failed: {exc}") from exc

    if result is None or result.isNull():
        raise GeometryError("Direct edit produced an empty shape — the distance is likely too large")
    return result


# ============================================================================
# Volumetric meshing (Analysis)
# ============================================================================

# gmsh keeps its "current model" as global process state (gmsh.initialize()/finalize()
# and gmsh.model.add() aren't per-call-isolated) — but FastAPI's sync `def` routes in
# main.py run in a thread pool, so two /mesh/tetrahedral requests could otherwise
# interleave and corrupt each other's model. Serializing with a lock is the simplest
# correct fix; meshing is already the slowest op in this service, so it isn't a
# meaningful throughput cliff the way it would be for e.g. /primitives.
_gmsh_lock = threading.Lock()


def _match_faces_to_gmsh_surfaces(shape: Part.Shape) -> dict[int, int]:
    """Maps this shape's own Faces, by index (the same index space as FaceInfo and
    mesh.faceIndexByTriangle), to the gmsh surface tags gmsh assigned when it re-imported
    this same shape's STEP export. gmsh's tag numbering isn't guaranteed to follow
    FreeCAD's Faces order, so this matches by nearest centroid instead of assuming it —
    confirmed exact (distance 0) against a real gmsh 4.15/FreeCAD 1.1.3 build for both a
    plain box and a boolean-cut shape with a curved face. A shape with two geometrically
    identical faces at the exact same centroid (a true mirror-symmetric duplicate) could
    match them swapped; harmless today since nothing yet targets a face by this mapping,
    only groups boundary triangles by it."""
    import gmsh

    remaining = [(tag, gmsh.model.occ.getCenterOfMass(2, tag)) for _, tag in gmsh.model.getEntities(2)]
    mapping: dict[int, int] = {}
    for face_index, face in enumerate(shape.Faces):
        com = face.CenterOfMass
        target = (com.x, com.y, com.z)
        best_idx, best_dist = None, float("inf")
        for i, (_tag, gcom) in enumerate(remaining):
            dist = sum((a - b) ** 2 for a, b in zip(target, gcom))
            if dist < best_dist:
                best_dist = dist
                best_idx = i
        if best_idx is not None:
            tag, _ = remaining.pop(best_idx)
            mapping[face_index] = tag
    return mapping


def do_tetrahedral_mesh(req: TetrahedralMeshRequest) -> TetMeshResult:
    """Real geometry-aware volumetric meshing via gmsh, for the FEA workflow's Analysis
    phase. There's no volume mesher in Part/OCC itself, so this exports the stored shape
    to STEP and re-imports it through gmsh's own OCC kernel (gmsh has no direct FreeCAD-
    shape import), meshes it into linear tetrahedra, and reports which boundary triangles
    belong to which of the shape's own Faces (see _match_faces_to_gmsh_surfaces) so a
    caller can eventually target a boundary condition at a specific real face instead of
    only a world-space point/box/sphere region. This replaces the frontend's earlier
    axis-aligned-bounding-box placeholder mesher, which meshed a box around the part
    rather than the part itself.
    """
    shape = shape_store.get(req.shapeId)
    if not shape.Solids:
        raise GeometryError("Tetrahedral meshing needs a solid body; this shape has no solids")

    import gmsh  # imported lazily: gmsh.initialize() touches global state, so only pay for it here

    tmp_path = None
    with _gmsh_lock:
        try:
            with tempfile.NamedTemporaryFile(suffix=".step", delete=False) as tmp:
                tmp_path = tmp.name
            shape.exportStep(tmp_path)

            # interruptible=False: gmsh's default Ctrl+C handling registers a signal
            # handler, which Python only allows from the main thread — but FastAPI's
            # sync `def` routes run in a worker thread, so the default would always
            # raise "signal only works in main thread of the main interpreter" here.
            gmsh.initialize(interruptible=False)
            try:
                gmsh.model.add("mesh")
                gmsh.model.occ.importShapes(tmp_path)
                gmsh.model.occ.synchronize()

                bbox = shape.BoundBox
                diagonal = math.sqrt(bbox.XLength ** 2 + bbox.YLength ** 2 + bbox.ZLength ** 2)
                default_size = max(diagonal / 20, 1e-3)
                max_size = req.maxElementSize or default_size
                min_size = req.minElementSize or (max_size / 5)
                gmsh.option.setNumber("Mesh.MeshSizeMax", max_size)
                gmsh.option.setNumber("Mesh.MeshSizeMin", min_size)

                face_to_surface = _match_faces_to_gmsh_surfaces(shape)

                gmsh.model.mesh.generate(3)

                node_tags, node_coords, _ = gmsh.model.mesh.getNodes()
                nodes = [
                    TetMeshNode(
                        id=int(node_tags[i]),
                        x=node_coords[3 * i], y=node_coords[3 * i + 1], z=node_coords[3 * i + 2],
                    )
                    for i in range(len(node_tags))
                ]

                elements: list[TetMeshElement] = []
                el_types, el_tags, el_node_tags = gmsh.model.mesh.getElements(3)
                el_id = 1
                for el_type, tags_for_type, nodes_for_type in zip(el_types, el_tags, el_node_tags):
                    if el_type != 4:  # 4 = linear (4-node) tetrahedron; skip anything else gmsh might add
                        continue
                    for i in range(len(tags_for_type)):
                        node_ids = [int(x) for x in nodes_for_type[4 * i:4 * i + 4]]
                        elements.append(TetMeshElement(id=el_id, nodeIds=node_ids))
                        el_id += 1

                if not elements:
                    raise GeometryError("gmsh produced no tetrahedra for this shape")

                boundary_faces: list[BoundaryFaceGroup] = []
                for face_index, surface_tag in face_to_surface.items():
                    triangles: list[list[int]] = []
                    b_types, _b_tags, b_node_tags = gmsh.model.mesh.getElements(2, surface_tag)
                    for b_type, nodes_for_type in zip(b_types, b_node_tags):
                        if b_type != 2:  # 2 = linear (3-node) triangle
                            continue
                        for i in range(len(nodes_for_type) // 3):
                            triangles.append([int(x) for x in nodes_for_type[3 * i:3 * i + 3]])
                    if triangles:
                        boundary_faces.append(BoundaryFaceGroup(faceIndex=face_index, triangles=triangles))
            finally:
                gmsh.finalize()
        except GeometryError:
            raise
        except Exception as exc:
            raise GeometryError(f"Tetrahedral meshing failed: {exc}") from exc
        finally:
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass

    return TetMeshResult(nodes=nodes, elements=elements, boundaryFaces=boundary_faces)


# ============================================================================
# Tessellation, edges, mass properties
# ============================================================================


def _compute_vertex_normals(positions: list[float], indices: list[int]) -> list[float]:
    vertex_count = len(positions) // 3
    normals = [0.0] * (vertex_count * 3)
    for i in range(0, len(indices), 3):
        i0, i1, i2 = indices[i], indices[i + 1], indices[i + 2]
        p0 = positions[i0 * 3:i0 * 3 + 3]
        p1 = positions[i1 * 3:i1 * 3 + 3]
        p2 = positions[i2 * 3:i2 * 3 + 3]
        ux, uy, uz = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
        vx, vy, vz = p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]
        nx, ny, nz = uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx
        for idx in (i0, i1, i2):
            normals[idx * 3] += nx
            normals[idx * 3 + 1] += ny
            normals[idx * 3 + 2] += nz
    for i in range(vertex_count):
        x, y, z = normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]
        length = math.sqrt(x * x + y * y + z * z)
        if length > 1e-12:
            normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2] = x / length, y / length, z / length
        else:
            normals[i * 3 + 2] = 1.0
    return normals


def tessellate(shape: Part.Shape, tolerance: float = 0.5) -> MeshData:
    """Tessellates face-by-face, rather than the whole shape at once, so each triangle
    can be attributed to a source face (faceIndexByTriangle) for picking/highlighting —
    shape.tessellate() alone returns a flat triangle soup with no such mapping.
    clean=True drops any cached triangulation first; otherwise OCC reuses the existing
    mesh and a coarser tolerance silently has no effect."""
    positions: list[float] = []
    indices: list[int] = []
    face_index_by_triangle: list[int] = []
    vertex_offset = 0
    for face_idx, face in enumerate(shape.Faces):
        vertices, triangles = face.tessellate(tolerance, True)
        for v in vertices:
            positions.extend([v.x, v.y, v.z])
        for tri in triangles:
            indices.extend(idx + vertex_offset for idx in tri)
            face_index_by_triangle.append(face_idx)
        vertex_offset += len(vertices)
    normals = _compute_vertex_normals(positions, indices)
    return MeshData(
        positions=positions,
        normals=normals,
        indices=indices,
        faceIndexByTriangle=face_index_by_triangle,
    )


def discretize_edges(shape: Part.Shape, points_per_edge: int = 16) -> list[EdgePolyline]:
    result = []
    for i, edge in enumerate(shape.Edges):
        try:
            points = edge.discretize(Number=points_per_edge)
        except Exception:
            points = [v.Point for v in edge.Vertexes]
        flat: list[float] = []
        for pt in points:
            flat.extend([pt.x, pt.y, pt.z])
        result.append(EdgePolyline(edgeId=f"e{i}", points=flat))
    return result


def discretize_faces(shape: Part.Shape) -> list[FaceInfo]:
    """One FaceInfo per shape.Faces entry, in the same enumerate-order indexing that
    tessellate()'s faceIndexByTriangle and pattern/shell/direct-edit face selection use.
    centroid/normal are a representative point for UI labeling and future push/pull
    direction, not a precise area centroid."""
    result = []
    for i, face in enumerate(shape.Faces):
        try:
            u_min, u_max, v_min, v_max = face.ParameterRange
            point = face.valueAt((u_min + u_max) / 2, (v_min + v_max) / 2)
            normal = face.normalAt((u_min + u_max) / 2, (v_min + v_max) / 2)
            centroid = [point.x, point.y, point.z]
            normal_xyz = [normal.x, normal.y, normal.z]
        except Exception:
            center = face.CenterOfMass
            centroid = [center.x, center.y, center.z]
            normal_xyz = [0.0, 0.0, 1.0]
        result.append(FaceInfo(faceId=f"f{i}", centroid=centroid, normal=normal_xyz))
    return result


def discretize_vertices(shape: Part.Shape) -> list[VertexInfo]:
    result = []
    for i, vertex in enumerate(shape.Vertexes):
        p = vertex.Point
        result.append(VertexInfo(vertexId=f"v{i}", point=[p.x, p.y, p.z]))
    return result


def _solids_of(shape: Part.Shape) -> list:
    solids = list(shape.Solids)
    return solids if solids else [shape]


def mass_properties(shape: Part.Shape, density: float = 1.0) -> MassProperties:
    # CenterOfMass/PrincipalProperties are Solid-level attributes; a Compound (what a
    # boolean returns when it yields several bodies) doesn't have them, so work per-solid.
    solids = _solids_of(shape)
    volume = sum(s.Volume for s in solids)
    area = shape.Area

    if volume > 1e-12:
        com_xyz = [
            sum(getattr(s.CenterOfMass, axis) * s.Volume for s in solids) / volume
            for axis in ("x", "y", "z")
        ]
    else:
        center = shape.BoundBox.Center
        com_xyz = [center.x, center.y, center.z]

    try:
        # FreeCAD's MatrixOfInertia is about the shape's own center of mass, so it's
        # only exact for a single solid; a multi-solid compound falls back to zeros.
        if len(solids) != 1:
            raise ValueError("multi-solid inertia not combined")
        matrix = solids[0].MatrixOfInertia
        inertia_flat = [
            matrix.A11, matrix.A12, matrix.A13, matrix.A14,
            matrix.A21, matrix.A22, matrix.A23, matrix.A24,
            matrix.A31, matrix.A32, matrix.A33, matrix.A34,
            matrix.A41, matrix.A42, matrix.A43, matrix.A44,
        ]
        principal = solids[0].PrincipalProperties
        principal_axes = [
            [principal["FirstAxisOfInertia"].x, principal["FirstAxisOfInertia"].y, principal["FirstAxisOfInertia"].z],
            [principal["SecondAxisOfInertia"].x, principal["SecondAxisOfInertia"].y, principal["SecondAxisOfInertia"].z],
            [principal["ThirdAxisOfInertia"].x, principal["ThirdAxisOfInertia"].y, principal["ThirdAxisOfInertia"].z],
        ]
        principal_moments = list(principal["Moments"])
    except Exception:
        inertia_flat = [0.0] * 15 + [1.0]
        principal_axes = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
        principal_moments = [0.0, 0.0, 0.0]

    return MassProperties(
        volume=volume,
        surfaceArea=area,
        mass=volume * density,
        centerOfMass=com_xyz,
        momentOfInertia=inertia_flat,
        principalAxes=principal_axes,
        principalMoments=principal_moments,
    )


def _normalize(shape: Part.Shape) -> Part.Shape:
    """Booleans return a Compound even when the result is a single body. Unwrap that
    to the bare Solid so it behaves like every other result (makeFillet/makeChamfer
    and the Solid-level mass properties all want a Solid, not a Compound)."""
    solids = list(shape.Solids)
    if shape.ShapeType == "Compound" and len(solids) == 1:
        return solids[0]
    return shape


def shape_to_result(shape: Part.Shape, edge_points: int = 16, tolerance: float = 0.5) -> ShapeResult:
    shape = _normalize(shape)
    shape_id = shape_store.put(shape)
    return ShapeResult(
        shapeId=shape_id,
        mesh=tessellate(shape, tolerance=tolerance),
        edges=discretize_edges(shape, points_per_edge=edge_points),
        faces=discretize_faces(shape),
        vertices=discretize_vertices(shape),
        massProperties=mass_properties(shape),
    )
