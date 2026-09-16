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


class EdgePolyline(BaseModel):
    edgeId: str
    points: list[float]  # flat x,y,z triplets, world space


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
    edgeIndices: list[int]  # 0-based, into the shape's own Edges list
    radius: float


class ChamferRequest(BaseModel):
    shapeId: str
    edgeIndices: list[int]
    distance: float
