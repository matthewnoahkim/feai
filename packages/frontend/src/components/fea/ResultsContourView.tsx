/**
 * ResultsContourView - color plot of a solved workflow result on the mesh surface.
 *
 * Draws the outer surface of the tet mesh with each node colored by its result value:
 * blue for the least stress/displacement in the model, red for the most, through cyan,
 * green, and yellow. A key on the right maps the colors back to values. The values come
 * from the solver's per-node fields (AnalysisResultData.fields).
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { AnalysisResultData, MeshData } from '@/store/workflowStore';
import { COLORMAPS, interpolateColor } from '@/utils/fea-utils';

export type ContourField = 'vonMises' | 'displacement';

type DeformMode = 'undeformed' | 'true' | 'exaggerated';

// Blue (least) -> cyan -> green -> yellow -> red (most).
const STOPS = COLORMAPS.rainbow;
const LEGEND_GRADIENT = `linear-gradient(to top, ${STOPS.map(
  (s) => `rgb(${s.color.join(',')}) ${s.position * 100}%`
).join(', ')})`;
const LEGEND_TICKS = 6;

const FIELD_INFO: Record<ContourField, { label: string; unit: string; scale: number }> = {
  vonMises: { label: 'Von Mises stress', unit: 'MPa', scale: 1e-6 },
  displacement: { label: 'Displacement', unit: 'mm', scale: 1 },
};

interface SurfacePart {
  name: string;
  /** Node index (into the field arrays) of each surface triangle corner, 3 per triangle. */
  corners: Int32Array;
}

interface Surface {
  parts: SurfacePart[];
  /** Rest position (mm) of every field node, xyz interleaved. */
  rest: Float32Array;
  center: THREE.Vector3;
  radius: number;
}

/**
 * Boundary surface of each part of a linear-tet mesh: the faces only one tet of that part
 * uses, wound outward. Parts come from meshData.regions. A mesh of bonded parts (the
 * boomilever block glued into its slot) is one solid, so extracting a single outer
 * surface would hide every face where the parts meet. Done per part, each part keeps its
 * own faces (the slot walls, the block's sides), and either part can be hidden to show
 * the other.
 */
function extractSurface(meshData: MeshData, fields: NonNullable<AnalysisResultData['fields']>): Surface | null {
  const nodes = meshData.nodes;
  const elements = meshData.elements;
  if (!nodes?.length || !elements?.length) return null;

  // Map mesh node ids to positions in the field arrays.
  const count = fields.vonMises.length;
  if (fields.displacement.length !== 3 * count) return null;
  const ids = fields.nodeIds ?? (nodes.length === count ? [...nodes].map((n) => n.id).sort((a, b) => a - b) : null);
  if (!ids || ids.length !== count) return null;
  const indexOf = new Map<number, number>();
  ids.forEach((id, i) => indexOf.set(id, i));

  const rest = new Float32Array(3 * count);
  for (const n of nodes) {
    const i = indexOf.get(n.id);
    if (i === undefined) continue;
    rest[3 * i] = n.x; rest[3 * i + 1] = n.y; rest[3 * i + 2] = n.z;
  }

  const regions = meshData.regions;
  const useRegions = !!regions && regions.elementRegion.length === elements.length && regions.names.length > 0;
  const names = useRegions ? regions!.names : ['Model'];
  const faces = names.map(() => new Map<string, [number, number, number, number] | null>());
  const combos = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 3, 1], [1, 2, 3, 0]];
  elements.forEach((el, e) => {
    if (el.nodeIds.length < 4) return;
    const t = el.nodeIds.slice(0, 4).map((id) => indexOf.get(id));
    if (t.some((i) => i === undefined)) return;
    const part = faces[useRegions ? regions!.elementRegion[e] : 0];
    if (!part) return;
    for (const [a, b, c, opp] of combos) {
      const tri = [t[a]!, t[b]!, t[c]!];
      const key = [...tri].sort((x, y) => x - y).join(',');
      if (part.has(key)) part.set(key, null); // shared by two tets of this part: interior
      else part.set(key, [tri[0], tri[1], tri[2], t[opp]!]);
    }
  });

  const p = (i: number) => new THREE.Vector3(rest[3 * i], rest[3 * i + 1], rest[3 * i + 2]);
  const parts: SurfacePart[] = [];
  faces.forEach((partFaces, r) => {
    const corners: number[] = [];
    for (const f of partFaces.values()) {
      if (!f) continue;
      const [a, b, c, opp] = f;
      const pa = p(a);
      const normal = new THREE.Vector3().crossVectors(p(b).sub(pa), p(c).sub(pa));
      // Outward = pointing away from the tet's fourth node.
      if (normal.dot(p(opp).sub(pa)) > 0) corners.push(a, c, b);
      else corners.push(a, b, c);
    }
    if (corners.length) parts.push({ name: names[r], corners: Int32Array.from(corners) });
  });
  if (parts.length === 0) return null;

  const box = new THREE.Box3();
  for (let i = 0; i < count; i++) box.expandByPoint(p(i));
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  return { parts, rest, center: sphere.center, radius: sphere.radius || 1 };
}

function nodeValues(field: ContourField, fields: NonNullable<AnalysisResultData['fields']>): Float64Array {
  if (field === 'vonMises') return Float64Array.from(fields.vonMises);
  const d = fields.displacement;
  const out = new Float64Array(d.length / 3);
  for (let i = 0; i < out.length; i++) out[i] = Math.hypot(d[3 * i], d[3 * i + 1], d[3 * i + 2]);
  return out;
}

function formatTick(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 0.01) return v.toFixed(2);
  return v.toExponential(1);
}

export function ResultsContourView({
  meshData,
  results,
  field,
  onFieldChange,
}: {
  meshData: MeshData;
  results: AnalysisResultData;
  field: ContourField;
  onFieldChange: (field: ContourField) => void;
}) {
  const fields = results.fields!;
  const [deform, setDeform] = useState<DeformMode>('undeformed');
  const surface = useMemo(() => extractSurface(meshData, fields), [meshData, fields]);
  const values = useMemo(() => nodeValues(field, fields), [field, fields]);
  const [min, max] = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (const v of values) { if (v < lo) lo = v; if (v > hi) hi = v; }
    return [lo, hi];
  }, [values]);

  const maxDisp = useMemo(() => {
    const d = fields.displacement;
    let m = 0;
    for (let i = 0; i < d.length; i += 3) m = Math.max(m, Math.hypot(d[i], d[i + 1], d[i + 2]));
    return m;
  }, [fields]);
  // Exaggeration that makes the largest displacement 10% of the model's size.
  const exaggeration = surface && maxDisp > 0 ? Math.max(1, Math.round((0.1 * 2 * surface.radius) / maxDisp)) : 1;
  const deformScale = deform === 'undeformed' ? 0 : deform === 'true' ? 1 : exaggeration;

  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const partGeometries = useMemo(() => {
    if (!surface) return [];
    const { rest } = surface;
    const d = fields.displacement;
    const span = max - min;
    const c = new THREE.Color();
    return surface.parts.map(({ name, corners }) => {
      const positions = new Float32Array(corners.length * 3);
      const colors = new Float32Array(corners.length * 3);
      for (let k = 0; k < corners.length; k++) {
        const i = corners[k];
        for (let a = 0; a < 3; a++) positions[3 * k + a] = rest[3 * i + a] + deformScale * d[3 * i + a];
        const [r, g, b] = interpolateColor(STOPS, span > 0 ? (values[i] - min) / span : 0);
        c.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
        colors[3 * k] = c.r; colors[3 * k + 1] = c.g; colors[3 * k + 2] = c.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      // Feature edges of this part alone, so the outline of every part (the slot, the
      // block) shows even where it sits flush with another part.
      return { name, geometry, edges: new THREE.EdgesGeometry(geometry, 30) };
    });
  }, [surface, fields, values, min, max, deformScale]);

  useEffect(() => () => {
    for (const g of partGeometries) { g.geometry.dispose(); g.edges.dispose(); }
  }, [partGeometries]);

  const togglePart = (name: string) => setHidden((prev) => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  if (!surface || partGeometries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-cad-text-dim font-sans">
        These results don&apos;t include per-node values. Run the analysis again to see the color plot.
      </div>
    );
  }

  const info = FIELD_INFO[field];
  const { center, radius } = surface;
  const view = new THREE.Vector3(1, -1.4, 1).normalize().multiplyScalar(radius * 2.4).add(center);
  const ticks = Array.from({ length: LEGEND_TICKS }, (_, i) => {
    const t = 1 - i / (LEGEND_TICKS - 1);
    return (min + t * (max - min)) * info.scale;
  });

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: view.toArray(), up: [0, 0, 1], fov: 40, near: radius / 100, far: radius * 100 }}
        gl={{ antialias: true }}
        style={{ background: '#f8fafc' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[radius, -radius, 2 * radius]} intensity={0.9} />
        <directionalLight position={[-radius, radius, -radius]} intensity={0.35} />
        {partGeometries.filter((g) => !hidden.has(g.name)).map((g) => (
          <group key={g.name}>
            <mesh geometry={g.geometry}>
              <meshLambertMaterial
                vertexColors
                side={THREE.DoubleSide}
                polygonOffset
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
              />
            </mesh>
            <lineSegments geometry={g.edges}>
              <lineBasicMaterial color="#111827" transparent opacity={0.7} />
            </lineSegments>
          </group>
        ))}
        <OrbitControls target={center} makeDefault />
      </Canvas>

      {/* Field + deformation controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <div className="flex bg-white/90 border border-cad-border text-xs font-sans">
          {(['vonMises', 'displacement'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFieldChange(f)}
              className={`px-3 py-1.5 transition-colors ${field === f ? 'bg-cad-accent text-white' : 'text-cad-text hover:bg-gray-100'}`}
            >
              {f === 'vonMises' ? 'Stress' : 'Displacement'}
            </button>
          ))}
        </div>
        <select
          value={deform}
          onChange={(e) => setDeform(e.target.value as DeformMode)}
          className="bg-white/90 border border-cad-border text-xs font-sans px-2 py-1.5 text-cad-text"
          aria-label="Deformed shape"
        >
          <option value="undeformed">Undeformed shape</option>
          <option value="true">Deformed (true scale)</option>
          <option value="exaggerated">Deformed (x{exaggeration})</option>
        </select>
        {partGeometries.length > 1 && (
          <div className="bg-white/90 border border-cad-border text-xs font-sans px-2 py-1.5 space-y-1">
            <div className="text-[10px] text-cad-text-dim">Parts</div>
            {partGeometries.map((g) => (
              <label key={g.name} className="flex items-center gap-1.5 text-cad-text cursor-pointer">
                <input type="checkbox" checked={!hidden.has(g.name)} onChange={() => togglePart(g.name)} />
                {g.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color key */}
      <div className="absolute top-3 right-3 bg-white/90 border border-cad-border px-3 py-2 font-sans">
        <div className="text-xs font-medium text-cad-text">{info.label}</div>
        <div className="text-[10px] text-cad-text-dim mb-2">{info.unit}, per node</div>
        <div className="flex gap-2">
          <div className="w-4 h-48 border border-gray-300" style={{ background: LEGEND_GRADIENT }} />
          <div className="h-48 flex flex-col justify-between text-[11px] text-cad-text tabular-nums">
            {ticks.map((v, i) => <span key={i} className="leading-none">{formatTick(v)}</span>)}
          </div>
        </div>
        <div className="mt-2 space-y-0.5 text-[10px] text-cad-text-dim">
          <div className="flex items-center gap-1"><span className="inline-block w-2 h-2" style={{ background: 'rgb(255,0,0)' }} /> Most</div>
          <div className="flex items-center gap-1"><span className="inline-block w-2 h-2" style={{ background: 'rgb(0,0,255)' }} /> Least</div>
        </div>
      </div>

      {deformScale > 1 && (
        <div className="absolute bottom-3 left-3 text-[11px] font-sans text-cad-text-dim bg-white/80 px-2 py-1">
          Deformation exaggerated x{deformScale}
        </div>
      )}
    </div>
  );
}
