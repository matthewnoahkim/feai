"""FreeCAD-backed modeling operations.

Thin wrappers over FreeCAD's Part module: build a 2D profile (rectangle/circle/polygon,
in the same corner1/corner2 | start/end | center/corner | center+radius conventions
documentStore.ts already uses), then extrude/revolve/sweep/loft it into a real solid,
or combine/modify existing solids (boolean, fillet, chamfer). Every op ends by
tessellating the result and registering it in shape_store so later requests (a boolean
against this body, a fillet on its edges) can reference it by shapeId.
"""

import math
from typing import Any

import FreeCAD
import Mesh
import Part
from FreeCAD import Matrix, Placement, Vector

from . import shape_store
from .schemas import (
    BooleanRequest,
    ChamferRequest,
    EdgePolyline,
    ExtrudeRequest,
    FaceInfo,
    FilletRequest,
    LoftRequest,
    MassProperties,
    MeshData,
    MeshImportRequest,
    Plane,
    PathEntity,
    PrimitiveRequest,
    ProfileEntity,
    RevolveRequest,
    ShapeResult,
    SweepRequest,
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
