"""In-memory registry of live FreeCAD shapes, keyed by an opaque shapeId.

Booleans and fillets/chamfers operate on a previously-created shape (e.g. "add this
extrude to the body from the last feature"), so shapes need to be addressable across
requests rather than re-derived from a tessellated mesh each time (which would lose
exact B-rep topology). This is process-local state — fine for a single cad-server
instance; a multi-instance deployment would need a sticky session or a shared store.
"""

import threading
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import Part

_lock = threading.Lock()
_shapes: dict[str, "Part.Shape"] = {}

MAX_SHAPES = 2000  # simple bound so a long-running dev instance doesn't leak forever


def put(shape: "Part.Shape") -> str:
    shape_id = uuid.uuid4().hex
    with _lock:
        if len(_shapes) >= MAX_SHAPES:
            # Evict arbitrarily — this is a soft cap for dev/staging, not a real LRU cache.
            _shapes.pop(next(iter(_shapes)))
        _shapes[shape_id] = shape
    return shape_id


def get(shape_id: str) -> "Part.Shape":
    with _lock:
        shape = _shapes.get(shape_id)
    if shape is None:
        raise KeyError(f"Unknown shapeId: {shape_id}")
    return shape


def delete(shape_id: str) -> None:
    with _lock:
        _shapes.pop(shape_id, None)
