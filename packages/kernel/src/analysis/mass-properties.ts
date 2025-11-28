// ============================================================================
// Mass Properties Calculation
// ============================================================================

import { SolidData, MassProperties, Vector3, Matrix4 as Matrix4Type, Material } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { BRepTessellator } from '../geometry/tessellation';

/**
 * Calculate mass properties from a solid
 */
export class MassPropertiesCalculator {
  /**
   * Calculate mass properties of a solid
   */
  static calculate(solid: SolidData, material?: Material): MassProperties {
    // Tessellate the solid to get triangles
    const mesh = BRepTessellator.tessellate(solid);
    
    // Calculate volume and surface area using divergence theorem
    let volume = 0;
    let surfaceArea = 0;
    
    // Center of mass accumulator
    let cx = 0, cy = 0, cz = 0;
    
    // Moment of inertia components
    let Ixx = 0, Iyy = 0, Izz = 0;
    let Ixy = 0, Ixz = 0, Iyz = 0;
    
    // Process each triangle
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      const v0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const v1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const v2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      // Triangle area
      const edge1 = v1.sub(v0);
      const edge2 = v2.sub(v0);
      const cross = edge1.cross(edge2);
      const area = cross.length() / 2;
      surfaceArea += area;
      
      // Signed volume using divergence theorem
      // Volume = (1/6) * sum of (v0 · (v1 × v2))
      const signedVolume = Vec3.tripleProduct(v0, v1, v2) / 6;
      volume += signedVolume;
      
      // Center of mass contribution
      const centroid = v0.add(v1).add(v2).div(3);
      cx += signedVolume * centroid.x;
      cy += signedVolume * centroid.y;
      cz += signedVolume * centroid.z;
      
      // Moment of inertia contribution (about origin)
      // Using the fact that for a tetrahedron with one vertex at origin:
      // I = (density * volume / 20) * matrix
      const vol = Math.abs(signedVolume);
      const factor = vol / 20;
      
      // Diagonal terms
      Ixx += factor * (
        v0.y * v0.y + v0.y * v1.y + v1.y * v1.y +
        v0.y * v2.y + v1.y * v2.y + v2.y * v2.y +
        v0.z * v0.z + v0.z * v1.z + v1.z * v1.z +
        v0.z * v2.z + v1.z * v2.z + v2.z * v2.z
      );
      
      Iyy += factor * (
        v0.x * v0.x + v0.x * v1.x + v1.x * v1.x +
        v0.x * v2.x + v1.x * v2.x + v2.x * v2.x +
        v0.z * v0.z + v0.z * v1.z + v1.z * v1.z +
        v0.z * v2.z + v1.z * v2.z + v2.z * v2.z
      );
      
      Izz += factor * (
        v0.x * v0.x + v0.x * v1.x + v1.x * v1.x +
        v0.x * v2.x + v1.x * v2.x + v2.x * v2.x +
        v0.y * v0.y + v0.y * v1.y + v1.y * v1.y +
        v0.y * v2.y + v1.y * v2.y + v2.y * v2.y
      );
      
      // Off-diagonal terms
      Ixy -= factor * (
        2 * v0.x * v0.y + v0.x * v1.y + v0.x * v2.y +
        v1.x * v0.y + 2 * v1.x * v1.y + v1.x * v2.y +
        v2.x * v0.y + v2.x * v1.y + 2 * v2.x * v2.y
      ) / 2;
      
      Ixz -= factor * (
        2 * v0.x * v0.z + v0.x * v1.z + v0.x * v2.z +
        v1.x * v0.z + 2 * v1.x * v1.z + v1.x * v2.z +
        v2.x * v0.z + v2.x * v1.z + 2 * v2.x * v2.z
      ) / 2;
      
      Iyz -= factor * (
        2 * v0.y * v0.z + v0.y * v1.z + v0.y * v2.z +
        v1.y * v0.z + 2 * v1.y * v1.z + v1.y * v2.z +
        v2.y * v0.z + v2.y * v1.z + 2 * v2.y * v2.z
      ) / 2;
    }
    
    // Ensure positive volume
    volume = Math.abs(volume);
    
    // Finalize center of mass
    if (volume > 0) {
      cx /= volume;
      cy /= volume;
      cz /= volume;
    }
    
    const centerOfMass: Vector3 = { x: cx, y: cy, z: cz };
    
    // Calculate mass
    const density = material?.density || 1000; // Default: water (kg/m³)
    const volumeInM3 = volume * 1e-9; // Assuming mm³ to m³
    const mass = density * volumeInM3;
    
    // Parallel axis theorem to shift moment of inertia to center of mass
    const cmX = cx, cmY = cy, cmZ = cz;
    
    Ixx -= mass * (cmY * cmY + cmZ * cmZ);
    Iyy -= mass * (cmX * cmX + cmZ * cmZ);
    Izz -= mass * (cmX * cmX + cmY * cmY);
    Ixy += mass * cmX * cmY;
    Ixz += mass * cmX * cmZ;
    Iyz += mass * cmY * cmZ;
    
    // Build inertia tensor as 4x4 matrix
    const momentOfInertia: Matrix4Type = [
      Ixx, Ixy, Ixz, 0,
      Ixy, Iyy, Iyz, 0,
      Ixz, Iyz, Izz, 0,
      0, 0, 0, 1
    ];
    
    // Calculate principal axes and moments (eigenvalue decomposition)
    const { axes, moments } = this.computePrincipalAxes(Ixx, Iyy, Izz, Ixy, Ixz, Iyz);
    
    return {
      volume,
      surfaceArea,
      mass,
      centerOfMass,
      momentOfInertia,
      principalAxes: axes,
      principalMoments: moments
    };
  }

  /**
   * Compute principal axes and moments from inertia tensor
   * Simplified eigenvalue computation
   */
  private static computePrincipalAxes(
    Ixx: number, Iyy: number, Izz: number,
    Ixy: number, Ixz: number, Iyz: number
  ): { axes: Vector3[]; moments: Vector3 } {
    // For simplicity, assume aligned axes (diagonal tensor)
    // A full implementation would use eigenvalue decomposition
    
    // Principal moments (approximate)
    const I1 = Ixx;
    const I2 = Iyy;
    const I3 = Izz;
    
    return {
      axes: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }
      ],
      moments: { x: I1, y: I2, z: I3 }
    };
  }

  /**
   * Calculate volume only (faster than full mass properties)
   */
  static calculateVolume(solid: SolidData): number {
    const mesh = BRepTessellator.tessellate(solid);
    let volume = 0;
    
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      const v0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const v1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const v2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      volume += Vec3.tripleProduct(v0, v1, v2) / 6;
    }
    
    return Math.abs(volume);
  }

  /**
   * Calculate surface area only
   */
  static calculateSurfaceArea(solid: SolidData): number {
    const mesh = BRepTessellator.tessellate(solid);
    let area = 0;
    
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      const v0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const v1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const v2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      const edge1 = v1.sub(v0);
      const edge2 = v2.sub(v0);
      area += edge1.cross(edge2).length() / 2;
    }
    
    return area;
  }
}

