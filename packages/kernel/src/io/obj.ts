/**
 * OBJ File Format Import/Export
 * Wavefront OBJ format for mesh geometry
 */

import { Vector3 } from '../math/vector'

export interface OBJMesh {
  name: string
  vertices: Vector3[]
  normals: Vector3[]
  textureCoords: Array<{ u: number; v: number }>
  faces: OBJFace[]
}

export interface OBJFace {
  vertices: number[]     // 1-indexed vertex indices
  normals?: number[]     // 1-indexed normal indices
  texCoords?: number[]   // 1-indexed texture coordinate indices
}

export interface OBJMaterial {
  name: string
  ambient?: { r: number; g: number; b: number }
  diffuse?: { r: number; g: number; b: number }
  specular?: { r: number; g: number; b: number }
  shininess?: number
  opacity?: number
  diffuseMap?: string
  normalMap?: string
}

export interface OBJFile {
  meshes: OBJMesh[]
  materials: Map<string, OBJMaterial>
  mtlFile?: string
}

/**
 * Parse OBJ file content
 */
export function parseOBJ(content: string): OBJFile {
  const lines = content.split('\n')
  
  const globalVertices: Vector3[] = []
  const globalNormals: Vector3[] = []
  const globalTexCoords: Array<{ u: number; v: number }> = []
  
  const meshes: OBJMesh[] = []
  let currentMesh: OBJMesh | null = null
  let mtlFile: string | undefined
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue
    
    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    
    switch (command) {
      case 'mtllib':
        mtlFile = parts.slice(1).join(' ')
        break
        
      case 'o':
      case 'g':
        // New object or group
        if (currentMesh) {
          meshes.push(currentMesh)
        }
        currentMesh = {
          name: parts.slice(1).join(' ') || 'unnamed',
          vertices: [],
          normals: [],
          textureCoords: [],
          faces: []
        }
        break
        
      case 'v':
        // Vertex position
        globalVertices.push(new Vector3(
          parseFloat(parts[1]) || 0,
          parseFloat(parts[2]) || 0,
          parseFloat(parts[3]) || 0
        ))
        break
        
      case 'vn':
        // Vertex normal
        globalNormals.push(new Vector3(
          parseFloat(parts[1]) || 0,
          parseFloat(parts[2]) || 0,
          parseFloat(parts[3]) || 1
        ))
        break
        
      case 'vt':
        // Texture coordinate
        globalTexCoords.push({
          u: parseFloat(parts[1]) || 0,
          v: parseFloat(parts[2]) || 0
        })
        break
        
      case 'f':
        // Face
        if (!currentMesh) {
          currentMesh = {
            name: 'default',
            vertices: [],
            normals: [],
            textureCoords: [],
            faces: []
          }
        }
        
        const face: OBJFace = {
          vertices: [],
          normals: [],
          texCoords: []
        }
        
        for (let i = 1; i < parts.length; i++) {
          const indices = parts[i].split('/')
          
          // Vertex index (required)
          const vIdx = parseInt(indices[0])
          face.vertices.push(vIdx > 0 ? vIdx : globalVertices.length + vIdx + 1)
          
          // Texture coordinate index (optional)
          if (indices[1] && indices[1].length > 0) {
            const vtIdx = parseInt(indices[1])
            face.texCoords!.push(vtIdx > 0 ? vtIdx : globalTexCoords.length + vtIdx + 1)
          }
          
          // Normal index (optional)
          if (indices[2] && indices[2].length > 0) {
            const vnIdx = parseInt(indices[2])
            face.normals!.push(vnIdx > 0 ? vnIdx : globalNormals.length + vnIdx + 1)
          }
        }
        
        if (face.texCoords!.length === 0) delete face.texCoords
        if (face.normals!.length === 0) delete face.normals
        
        currentMesh.faces.push(face)
        break
    }
  }
  
  // Add last mesh
  if (currentMesh) {
    meshes.push(currentMesh)
  }
  
  // If no meshes were created, create one with all geometry
  if (meshes.length === 0 && globalVertices.length > 0) {
    meshes.push({
      name: 'default',
      vertices: globalVertices,
      normals: globalNormals,
      textureCoords: globalTexCoords,
      faces: []
    })
  }
  
  // Copy global data to meshes
  for (const mesh of meshes) {
    mesh.vertices = globalVertices
    mesh.normals = globalNormals
    mesh.textureCoords = globalTexCoords
  }
  
  return {
    meshes,
    materials: new Map(),
    mtlFile
  }
}

/**
 * Parse MTL (material) file content
 */
export function parseMTL(content: string): Map<string, OBJMaterial> {
  const materials = new Map<string, OBJMaterial>()
  const lines = content.split('\n')
  
  let currentMaterial: OBJMaterial | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue
    
    const parts = trimmed.split(/\s+/)
    const command = parts[0]
    
    switch (command) {
      case 'newmtl':
        if (currentMaterial) {
          materials.set(currentMaterial.name, currentMaterial)
        }
        currentMaterial = { name: parts.slice(1).join(' ') }
        break
        
      case 'Ka':
        if (currentMaterial) {
          currentMaterial.ambient = {
            r: parseFloat(parts[1]) || 0,
            g: parseFloat(parts[2]) || 0,
            b: parseFloat(parts[3]) || 0
          }
        }
        break
        
      case 'Kd':
        if (currentMaterial) {
          currentMaterial.diffuse = {
            r: parseFloat(parts[1]) || 0,
            g: parseFloat(parts[2]) || 0,
            b: parseFloat(parts[3]) || 0
          }
        }
        break
        
      case 'Ks':
        if (currentMaterial) {
          currentMaterial.specular = {
            r: parseFloat(parts[1]) || 0,
            g: parseFloat(parts[2]) || 0,
            b: parseFloat(parts[3]) || 0
          }
        }
        break
        
      case 'Ns':
        if (currentMaterial) {
          currentMaterial.shininess = parseFloat(parts[1]) || 0
        }
        break
        
      case 'd':
      case 'Tr':
        if (currentMaterial) {
          const value = parseFloat(parts[1]) || 1
          currentMaterial.opacity = command === 'd' ? value : 1 - value
        }
        break
        
      case 'map_Kd':
        if (currentMaterial) {
          currentMaterial.diffuseMap = parts.slice(1).join(' ')
        }
        break
        
      case 'map_Bump':
      case 'bump':
        if (currentMaterial) {
          currentMaterial.normalMap = parts.slice(1).join(' ')
        }
        break
    }
  }
  
  if (currentMaterial) {
    materials.set(currentMaterial.name, currentMaterial)
  }
  
  return materials
}

/**
 * Export mesh to OBJ format
 */
export function exportOBJ(
  vertices: Vector3[],
  faces: number[][],
  normals?: Vector3[],
  textureCoords?: Array<{ u: number; v: number }>,
  name: string = 'exported'
): string {
  const lines: string[] = []
  
  // Header
  lines.push('# OBJ file exported by feai')
  lines.push(`# Vertices: ${vertices.length}`)
  lines.push(`# Faces: ${faces.length}`)
  lines.push('')
  
  // Object name
  lines.push(`o ${name}`)
  lines.push('')
  
  // Vertices
  for (const v of vertices) {
    lines.push(`v ${v.x.toFixed(6)} ${v.y.toFixed(6)} ${v.z.toFixed(6)}`)
  }
  lines.push('')
  
  // Texture coordinates
  if (textureCoords && textureCoords.length > 0) {
    for (const vt of textureCoords) {
      lines.push(`vt ${vt.u.toFixed(6)} ${vt.v.toFixed(6)}`)
    }
    lines.push('')
  }
  
  // Normals
  if (normals && normals.length > 0) {
    for (const vn of normals) {
      lines.push(`vn ${vn.x.toFixed(6)} ${vn.y.toFixed(6)} ${vn.z.toFixed(6)}`)
    }
    lines.push('')
  }
  
  // Faces
  for (const face of faces) {
    // OBJ uses 1-based indexing
    const indices = face.map(i => i + 1)
    
    if (normals && normals.length === vertices.length) {
      // Include normal indices (assuming per-vertex normals)
      const faceStr = indices.map(i => `${i}//${i}`).join(' ')
      lines.push(`f ${faceStr}`)
    } else if (textureCoords && textureCoords.length === vertices.length) {
      // Include texture coordinate indices
      const faceStr = indices.map(i => `${i}/${i}`).join(' ')
      lines.push(`f ${faceStr}`)
    } else {
      // Just vertex indices
      lines.push(`f ${indices.join(' ')}`)
    }
  }
  
  return lines.join('\n')
}

/**
 * Export material to MTL format
 */
export function exportMTL(materials: OBJMaterial[]): string {
  const lines: string[] = []
  
  lines.push('# MTL file exported by feai')
  lines.push('')
  
  for (const mat of materials) {
    lines.push(`newmtl ${mat.name}`)
    
    if (mat.ambient) {
      lines.push(`Ka ${mat.ambient.r.toFixed(6)} ${mat.ambient.g.toFixed(6)} ${mat.ambient.b.toFixed(6)}`)
    }
    
    if (mat.diffuse) {
      lines.push(`Kd ${mat.diffuse.r.toFixed(6)} ${mat.diffuse.g.toFixed(6)} ${mat.diffuse.b.toFixed(6)}`)
    }
    
    if (mat.specular) {
      lines.push(`Ks ${mat.specular.r.toFixed(6)} ${mat.specular.g.toFixed(6)} ${mat.specular.b.toFixed(6)}`)
    }
    
    if (mat.shininess !== undefined) {
      lines.push(`Ns ${mat.shininess.toFixed(2)}`)
    }
    
    if (mat.opacity !== undefined) {
      lines.push(`d ${mat.opacity.toFixed(6)}`)
    }
    
    if (mat.diffuseMap) {
      lines.push(`map_Kd ${mat.diffuseMap}`)
    }
    
    if (mat.normalMap) {
      lines.push(`map_Bump ${mat.normalMap}`)
    }
    
    lines.push('')
  }
  
  return lines.join('\n')
}

/**
 * Convert OBJ mesh to indexed triangle list
 */
export function objToTriangles(obj: OBJFile): {
  vertices: number[]
  normals: number[]
  indices: number[]
} {
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  let indexOffset = 0
  
  for (const mesh of obj.meshes) {
    for (const face of mesh.faces) {
      // Triangulate face (fan triangulation)
      for (let i = 1; i < face.vertices.length - 1; i++) {
        const v0 = face.vertices[0] - 1
        const v1 = face.vertices[i] - 1
        const v2 = face.vertices[i + 1] - 1
        
        // Add vertices
        const p0 = mesh.vertices[v0]
        const p1 = mesh.vertices[v1]
        const p2 = mesh.vertices[v2]
        
        vertices.push(p0.x, p0.y, p0.z)
        vertices.push(p1.x, p1.y, p1.z)
        vertices.push(p2.x, p2.y, p2.z)
        
        // Add normals
        if (face.normals && face.normals.length > 0) {
          const n0 = mesh.normals[face.normals[0] - 1]
          const n1 = mesh.normals[face.normals[i] - 1]
          const n2 = mesh.normals[face.normals[i + 1] - 1]
          
          normals.push(n0.x, n0.y, n0.z)
          normals.push(n1.x, n1.y, n1.z)
          normals.push(n2.x, n2.y, n2.z)
        } else {
          // Calculate face normal
          const edge1 = p1.subtract(p0)
          const edge2 = p2.subtract(p0)
          const normal = edge1.cross(edge2).normalize()
          
          normals.push(normal.x, normal.y, normal.z)
          normals.push(normal.x, normal.y, normal.z)
          normals.push(normal.x, normal.y, normal.z)
        }
        
        // Add indices
        indices.push(indexOffset, indexOffset + 1, indexOffset + 2)
        indexOffset += 3
      }
    }
  }
  
  return { vertices, normals, indices }
}

