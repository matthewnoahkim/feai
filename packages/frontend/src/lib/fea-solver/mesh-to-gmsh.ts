/**
 * Encode workflow volumetric mesh as Gmsh MSH 2.2 ASCII for POST /api/analyze (mesh.type: "file").
 */

export interface GmshMeshNode {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface GmshMeshElement {
  id: number;
  nodeIds: number[];
}

function isFiniteVec(n: GmshMeshNode): boolean {
  return Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.z) && Number.isFinite(n.id);
}

/**
 * @returns MSH 2.2 file contents, or null if the data cannot be represented as linear tets.
 */
export function workflowMeshToGmshMsh22(nodes: GmshMeshNode[], elements: GmshMeshElement[]): string | null {
  if (!nodes.length || !elements.length) return null;

  const nodeById = new Map<number, GmshMeshNode>();
  for (const n of nodes) {
    if (!isFiniteVec(n)) return null;
    nodeById.set(n.id, n);
  }

  const tets: GmshMeshElement[] = [];
  for (const el of elements) {
    if (!el.nodeIds?.length || el.nodeIds.length < 4) continue;
    const [a, b, c, d] = el.nodeIds;
    if (!nodeById.has(a) || !nodeById.has(b) || !nodeById.has(c) || !nodeById.has(d)) continue;
    tets.push(el);
  }

  if (tets.length === 0) return null;

  const sortedNodes = [...nodeById.values()].sort((p, q) => p.id - q.id);

  const lines: string[] = [
    '$MeshFormat',
    '2.2 0 8',
    '$EndMeshFormat',
    '$Nodes',
    String(sortedNodes.length),
  ];
  for (const n of sortedNodes) {
    lines.push(`${n.id} ${n.x} ${n.y} ${n.z}`);
  }
  lines.push('$EndNodes', '$Elements', String(tets.length));

  let gmshEl = 1;
  for (const el of tets) {
    const [a, b, c, d] = el.nodeIds;
    // Type 4 = 4-node tetrahedron; two tags (physical, elementary) both 1 for volume set.
    lines.push(`${gmshEl++} 4 2 1 1 ${a} ${b} ${c} ${d}`);
  }
  lines.push('$EndElements');

  return lines.join('\n');
}
