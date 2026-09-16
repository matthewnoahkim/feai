"""End-to-end smoke test against a running cad-server (default http://localhost:8000).

Exercises every endpoint with a real FreeCAD backend and checks the numbers against
analytic expectations. Run from any Python 3 with network access to the server:

    python smoketest.py [base_url]
"""

import json
import math
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
failures = 0


def post(path, body):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def check(label, ok, detail=""):
    global failures
    status = "PASS" if ok else "FAIL"
    if not ok:
        failures += 1
    print(f"[{status}] {label}{(' - ' + detail) if detail else ''}")


def close(a, b, rel=1e-3):
    return abs(a - b) <= rel * max(1.0, abs(b))


# --- primitives ------------------------------------------------------------
box = post("/primitives", {"type": "box", "params": {"width": 10, "height": 10, "depth": 10}})
mp = box["massProperties"]
check("box volume = 1000", close(mp["volume"], 1000), f"{mp['volume']}")
check("box surface area = 600", close(mp["surfaceArea"], 600), f"{mp['surfaceArea']}")
check("box center of mass = (5,5,5)", all(close(c, 5) for c in mp["centerOfMass"]), f"{mp['centerOfMass']}")
check("box principal moments = 16666.67 (was 0s before fix)",
      all(close(m, 16666.67, 1e-3) for m in mp["principalMoments"]), f"{mp['principalMoments']}")
check("box has 12 edges", len(box["edges"]) == 12, f"{len(box['edges'])}")
check("box mesh has 12 triangles", len(box["mesh"]["indices"]) == 36, f"{len(box['mesh']['indices'])//3}")

cyl = post("/primitives", {"type": "cylinder", "params": {"radius": 5, "height": 10}})
check("cylinder volume = pi*25*10", close(cyl["massProperties"]["volume"], math.pi * 25 * 10),
      f"{cyl['massProperties']['volume']}")

sph = post("/primitives", {"type": "sphere", "params": {"radius": 5}})
check("sphere volume = 4/3*pi*125", close(sph["massProperties"]["volume"], 4 / 3 * math.pi * 125),
      f"{sph['massProperties']['volume']}")

cone = post("/primitives", {"type": "cone", "params": {"radius1": 5, "radius2": 0, "height": 10}})
check("cone volume = 1/3*pi*25*10", close(cone["massProperties"]["volume"], math.pi * 25 * 10 / 3),
      f"{cone['massProperties']['volume']}")

# --- extrude (rectangle profile, corner1/corner2 convention from SketchCanvas) --
ext = post("/extrude", {
    "profile": {"type": "rectangle", "data": {"corner1": {"x": 0, "y": 0}, "corner2": {"x": 20, "y": 10}}},
    "plane": {"origin": [0, 0, 0], "normal": [0, 0, 1], "xAxis": [1, 0, 0]},
    "params": {"depth1": 5, "flipDirection1": False, "useSecondDirection": False, "depth2": 0,
               "useDraft": False, "draftAngle": 0, "draftOutward": False, "endCondition1": "blind"},
})
check("extrude 20x10 rect by 5 -> volume 1000", close(ext["massProperties"]["volume"], 1000),
      f"{ext['massProperties']['volume']}")

# extrude a circle with draft -> should be a frustum-ish loft, volume between the two extremes
ext_draft = post("/extrude", {
    "profile": {"type": "circle", "data": {"center": {"x": 0, "y": 0}, "radius": 10}},
    "plane": {"origin": [0, 0, 0], "normal": [0, 0, 1], "xAxis": [1, 0, 0]},
    "params": {"depth1": 10, "flipDirection1": False, "useSecondDirection": False, "depth2": 0,
               "useDraft": True, "draftAngle": 10, "draftOutward": False, "endCondition1": "blind"},
})
full_cyl = math.pi * 100 * 10
check("drafted extrude volume < undrafted cylinder", 0 < ext_draft["massProperties"]["volume"] < full_cyl,
      f"{ext_draft['massProperties']['volume']} vs {full_cyl}")

# --- revolve (circle offset from axis -> torus) ------------------------------
# circle radius 2 centered at x=10 on the XY plane, revolved around the Y axis -> torus R=10, r=2
rev = post("/revolve", {
    "profile": {"type": "circle", "data": {"center": {"x": 10, "y": 0}, "radius": 2}},
    "plane": {"origin": [0, 0, 0], "normal": [0, 0, 1], "xAxis": [1, 0, 0]},
    "axisPoint": [0, 0, 0],
    "axisDirection": [0, 1, 0],
    "params": {"angle": 360, "angle2": 0, "directionType": "full"},
})
torus_vol = 2 * math.pi**2 * 10 * 2**2
check("revolve circle -> torus volume 2*pi^2*R*r^2", close(rev["massProperties"]["volume"], torus_vol),
      f"{rev['massProperties']['volume']} vs {torus_vol}")

# --- boolean: box minus centered cylinder ------------------------------------
# cylinder r=2 h=10 at origin only overlaps the box's corner (box spans 0..10, cyl spans -2..2),
# so cut removes exactly a quarter of the cylinder.
cut = post("/boolean", {"op": "cut", "baseShapeId": box["shapeId"], "toolShapeId": cyl["shapeId"]})
# cyl r=5 actually (defined above) -> quarter of pi*25*10
expected_cut = 1000 - (math.pi * 25 * 10) / 4
check("boolean cut box - quarter cylinder", close(cut["massProperties"]["volume"], expected_cut),
      f"{cut['massProperties']['volume']} vs {expected_cut}")

union = post("/boolean", {"op": "union", "baseShapeId": box["shapeId"], "toolShapeId": cyl["shapeId"]})
expected_union = 1000 + (math.pi * 25 * 10) * 3 / 4
check("boolean union box + three-quarter cylinder", close(union["massProperties"]["volume"], expected_union),
      f"{union['massProperties']['volume']} vs {expected_union}")

inter = post("/boolean", {"op": "intersect", "baseShapeId": box["shapeId"], "toolShapeId": cyl["shapeId"]})
expected_inter = (math.pi * 25 * 10) / 4
check("boolean intersect = quarter cylinder", close(inter["massProperties"]["volume"], expected_inter),
      f"{inter['massProperties']['volume']} vs {expected_inter}")

# --- fillet / chamfer on the box --------------------------------------------
fil = post("/fillet", {"shapeId": box["shapeId"], "edgeIndices": list(range(12)), "radius": 1})
check("fillet all 12 box edges reduces volume", 0 < fil["massProperties"]["volume"] < 1000,
      f"{fil['massProperties']['volume']}")
check("filleted box has more edges than 12", len(fil["edges"]) > 12, f"{len(fil['edges'])}")

cham = post("/chamfer", {"shapeId": box["shapeId"], "edgeIndices": list(range(12)), "distance": 1})
check("chamfer all 12 box edges reduces volume", 0 < cham["massProperties"]["volume"] < 1000,
      f"{cham['massProperties']['volume']}")
# chamfer removes more material than a same-size fillet (flat cut vs rounded)
check("chamfer removes more than fillet", cham["massProperties"]["volume"] < fil["massProperties"]["volume"],
      f"chamfer {cham['massProperties']['volume']} < fillet {fil['massProperties']['volume']}")

# --- error handling ----------------------------------------------------------
try:
    post("/boolean", {"op": "cut", "baseShapeId": "does-not-exist", "toolShapeId": cyl["shapeId"]})
    check("unknown shapeId -> 404", False, "no error raised")
except urllib.error.HTTPError as e:
    check("unknown shapeId -> 404", e.code == 404, f"HTTP {e.code}")

try:
    post("/fillet", {"shapeId": box["shapeId"], "edgeIndices": [999], "radius": 1})
    check("out-of-range edge index -> 400", False, "no error raised")
except urllib.error.HTTPError as e:
    check("out-of-range edge index -> 400", e.code == 400, f"HTTP {e.code}")

print()
print("ALL PASSED" if failures == 0 else f"{failures} FAILURE(S)")
sys.exit(1 if failures else 0)
