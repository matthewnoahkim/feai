"""Generate the landing-page hero part once, from the real modeling engine.

Builds a bracket (base plate + upright + two bolt holes, filleted) through the public
API and writes its tessellation + B-rep edge polylines to the frontend's public dir, so
the home page renders a genuine engine-produced solid with no runtime dependency on
cad-server.

    python tools/make_hero_mesh.py [base_url] [out_path]
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(__file__), "..", "..", "frontend", "public", "landing", "hero.json"
)

XY = {"origin": [0, 0, 0], "normal": [0, 0, 1], "xAxis": [1, 0, 0]}


def post(path, body):
    req = urllib.request.Request(
        f"{BASE}{path}", data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def extrude(profile, plane, depth):
    return post("/extrude", {
        "profile": profile, "plane": plane,
        "params": {"depth1": depth, "flipDirection1": False, "useSecondDirection": False,
                   "depth2": 0, "useDraft": False, "draftAngle": 0, "draftOutward": False,
                   "endCondition1": "blind"},
    })


def rect(x1, y1, x2, y2):
    return {"type": "rectangle", "data": {"corner1": {"x": x1, "y": y1}, "corner2": {"x": x2, "y": y2}}}


def circle(cx, cy, r):
    return {"type": "circle", "data": {"center": {"x": cx, "y": cy}, "radius": r}}


# Base plate 60 x 40 x 8 on XY.
body = extrude(rect(-30, -20, 30, 20), XY, 8)

# Upright 8 thick, 40 wide, 48 tall, on the plate's -x end (plane normal +x, local u = +y, v = +z).
plate = extrude(rect(-20, 0, 20, 48), {"origin": [-30, 0, 0], "normal": [1, 0, 0], "xAxis": [0, 1, 0]}, 8)
body = post("/boolean", {"op": "union", "baseShapeId": body["shapeId"], "toolShapeId": plate["shapeId"]})

# Two through-holes in the base.
for cx, cy in ((15, 10), (15, -10)):
    hole = extrude(circle(cx, cy, 4), {"origin": [0, 0, -2], "normal": [0, 0, 1], "xAxis": [1, 0, 0]}, 12)
    body = post("/boolean", {"op": "cut", "baseShapeId": body["shapeId"], "toolShapeId": hole["shapeId"]})

# Fillet everything; if OCC refuses some edge combination, ship it unfilleted rather than fail.
try:
    body = post("/fillet", {"shapeId": body["shapeId"], "edgeIndices": [], "radius": 1.5})
    filleted = True
except urllib.error.HTTPError as exc:
    print("fillet skipped:", exc.read().decode()[:200])
    filleted = False

# The default 0.5 mm tessellation is editor-grade (~1.7 MB for this part); the landing page
# wants a light LOD, so re-mesh coarsely and shorten the edge polylines.
body = post(f"/shapes/{body['shapeId']}/tessellate", {"tolerance": 4.0, "edgePoints": 6})

# Normals are omitted on purpose (a third of the payload); the hero recomputes them client-side.
r3 = lambda xs: [round(v, 2) for v in xs]
out = {
    "positions": r3(body["mesh"]["positions"]),
    "indices": body["mesh"]["indices"],
    "edges": [{"edgeId": e["edgeId"], "points": r3(e["points"])} for e in body["edges"]],
    "meta": {
        "volume": round(body["massProperties"]["volume"], 2),
        "surfaceArea": round(body["massProperties"]["surfaceArea"], 2),
        "edgeCount": len(body["edges"]),
        "triangleCount": len(body["mesh"]["indices"]) // 3,
        "filleted": filleted,
    },
}

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(out, f, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)} bytes, {out['meta']}")
