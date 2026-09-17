"""Pydantic request/response models for the modeling API.

Mirrors the relevant slices of packages/shared/src/geometry.ts (MeshData, MassProperties)
so the JSON contract lines up with what the frontend already models, and the sketch
entity shapes documentStore.ts already uses (SketchEntity: {type, data}, plane:
{origin, normal, xAxis}) so profiles can be forwarded as-is.
"""

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class Plane(BaseModel):
    origin: list[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    normal: list[float] = Field(default_factory=lambda: [0.0, 0.0, 1.0])
    xAxis: list[float] = Field(default_factory=lambda: [1.0, 0.0, 0.0])


class ProfileEntity(BaseModel):
    """A single closed 2D profile, in the same shape as documentStore.ts's SketchEntity."""

    type: Literal["rectangle", "circle", "polygon"]
    data: dict[str, Any]


class PathEntity(BaseModel):
    """A single open 2D path segment (sweep path), matching SketchEntity for lines/arcs."""

    type: Literal["line", "arc"]
    data: dict[str, Any]


class MeshData(BaseModel):
    positions: list[float]
    normals: list[float]
    indices: list[int]
    faceIndexByTriangle: list[int]  # one entry per triangle; index into ShapeResult.faces


class EdgePolyline(BaseModel):
    edgeId: str
    points: list[float]  # flat x,y,z triplets, world space


class FaceInfo(BaseModel):
    faceId: str
    centroid: list[float]  # x,y,z, a representative point on the face, world space
    normal: list[float]  # x,y,z, unit normal at that point, world space


class VertexInfo(BaseModel):
    vertexId: str
    point: list[float]  # x,y,z, world space


class MassProperties(BaseModel):
    volume: float
    surfaceArea: float
    mass: float
    centerOfMass: list[float]
    momentOfInertia: list[float]  # flattened 4x4, row-major (Matrix4 shape)
    principalAxes: list[list[float]]
    principalMoments: list[float]


class ShapeResult(BaseModel):
    shapeId: str
    mesh: MeshData
    edges: list[EdgePolyline]
    faces: list[FaceInfo]
    vertices: list[VertexInfo]
    massProperties: MassProperties


class PrimitiveRequest(BaseModel):
    type: Literal["box", "cylinder", "sphere", "cone"]
    params: dict[str, float]


class ExtrudeParams(BaseModel):
    depth1: float = 25
    flipDirection1: bool = False
    useSecondDirection: bool = False
    depth2: float = 0
    useDraft: bool = False
    draftAngle: float = 0
    draftOutward: bool = False
    endCondition1: Literal["blind", "symmetric"] = "blind"


class ExtrudeRequest(BaseModel):
    profile: ProfileEntity
    plane: Plane = Field(default_factory=Plane)
    params: ExtrudeParams


class RevolveParams(BaseModel):
    angle: float = 360
    angle2: float = 0
    directionType: Literal["full", "one-direction", "symmetric"] = "full"


class RevolveRequest(BaseModel):
    profile: ProfileEntity
    plane: Plane = Field(default_factory=Plane)
    axisPoint: list[float]
    axisDirection: list[float]
    params: RevolveParams


class SweepParams(BaseModel):
    orientation: Literal["follow-path", "fixed", "keep-normal"] = "follow-path"
    twistAngle: float = 0
    endScale: float = 1.0


class SweepRequest(BaseModel):
    profile: ProfileEntity
    profilePlane: Plane = Field(default_factory=Plane)
    path: PathEntity
    pathPlane: Plane = Field(default_factory=Plane)
    params: SweepParams


class LoftProfile(BaseModel):
    profile: ProfileEntity
    plane: Plane = Field(default_factory=Plane)


class LoftParams(BaseModel):
    closedLoft: bool = False


class LoftRequest(BaseModel):
    profiles: list[LoftProfile]
    params: LoftParams


class BooleanRequest(BaseModel):
    op: Literal["union", "cut", "intersect"]
    baseShapeId: str
    toolShapeId: str


class FilletRequest(BaseModel):
    shapeId: str
    edgeIndices: list[int]  # 0-based, into the shape's own Edges list; empty = all edges
    radius: float


class ChamferRequest(BaseModel):
    shapeId: str
    edgeIndices: list[int]  # empty = all edges
    distance: float


class TessellateRequest(BaseModel):
    """Re-tessellate a stored shape at a chosen coarseness (e.g. a lightweight LOD)."""

    tolerance: float = 0.5
    edgePoints: int = 16


class MeshImportRequest(BaseModel):
    """A triangle mesh (e.g. a parsed STL) to turn into a real solid. Same flat layout as
    MeshData: xyz position triplets and 0-based triangle index triplets."""

    positions: list[float]
    indices: list[int]
    tolerance: float = 0.05


class LinearPatternRequest(BaseModel):
    shapeId: str
    direction1: list[float]
    count1: int  # total instances along direction1, including the original (>=1)
    spacing1: float
    direction2: Optional[list[float]] = None
    count2: Optional[int] = None
    spacing2: Optional[float] = None


class CircularPatternRequest(BaseModel):
    shapeId: str
    axisPoint: list[float]
    axisDirection: list[float]
    count: int  # total instances around the axis, including the original (>=1)
    angle: float = 360  # total spread; per-instance step is angle / count


class MirrorRequest(BaseModel):
    shapeId: str
    planeOrigin: list[float]
    planeNormal: list[float]
    merge: bool = True  # fuse the mirrored copy onto the original rather than replacing it


class ShellRequest(BaseModel):
    shapeId: str
    # 0-based, into the shape's own Faces list; faces to remove (open up). Must be
    # non-empty — confirmed against a real FreeCAD 1.1.3 build that a fully enclosed
    # hollow shell (no faces removed) is not supported (OCC's BRepOffsetAPI_MakeThickSolid
    # has no zero-opening mode; it raises "Null input shape"). Unlike fillet/chamfer's
    # edgeIndices, this is NOT shorthand for "all faces" either — see _selected_faces.
    faceIndices: list[int]
    thickness: float
