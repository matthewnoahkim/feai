'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HeroMesh {
  positions: number[]
  normals?: number[]
  indices: number[]
  edges: { edgeId: string; points: number[] }[]
  meta?: { volume?: number; surfaceArea?: number; edgeCount?: number; triangleCount?: number }
}

// Shown only if /landing/hero.json is missing - a plain box with its outline.
function fallbackMesh(): HeroMesh {
  const box = new THREE.BoxGeometry(60, 40, 8)
  const outline = new THREE.EdgesGeometry(box)
  const segments = Array.from(outline.getAttribute('position').array as ArrayLike<number>)
  const edges: HeroMesh['edges'] = []
  for (let i = 0; i + 5 < segments.length; i += 6) {
    edges.push({ edgeId: `e${i / 6}`, points: segments.slice(i, i + 6) })
  }
  return {
    positions: Array.from(box.getAttribute('position').array as ArrayLike<number>),
    indices: Array.from(box.getIndex()!.array as ArrayLike<number>),
    edges,
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

function Part({ data, wire, spin }: { data: HeroMesh; wire: number; spin: boolean }) {
  const group = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3))
    g.setIndex(data.indices)
    if (data.normals && data.normals.length === data.positions.length) {
      g.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3))
    } else {
      g.computeVertexNormals()
    }
    g.computeBoundingBox()
    return g
  }, [data])

  const edgeGeometry = useMemo(() => {
    const pts: number[] = []
    for (const edge of data.edges) {
      for (let i = 0; i + 5 < edge.points.length; i += 3) {
        pts.push(
          edge.points[i], edge.points[i + 1], edge.points[i + 2],
          edge.points[i + 3], edge.points[i + 4], edge.points[i + 5],
        )
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [data])

  const { center, scale } = useMemo(() => {
    const bb = geometry.boundingBox!
    const c = bb.getCenter(new THREE.Vector3())
    const size = bb.getSize(new THREE.Vector3()).length()
    return { center: c, scale: 70 / (size || 1) }
  }, [geometry])

  useFrame((_, dt) => {
    if (spin && group.current) group.current.rotation.y += dt * 0.22
  })

  return (
    <group ref={group} rotation={[0.48, -0.7, 0]}>
      <group scale={scale}>
        <group position={[-center.x, -center.y, -center.z]}>
          <mesh geometry={geometry}>
            <meshStandardMaterial
              color="#1a4d8f"
              metalness={0.3}
              roughness={0.5}
              transparent
              opacity={1 - wire * 0.8}
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </mesh>
          <lineSegments geometry={edgeGeometry}>
            <lineBasicMaterial color="#0d2a4d" transparent opacity={0.5 + wire * 0.5} />
          </lineSegments>
        </group>
      </group>
    </group>
  )
}

export default function HeroScene() {
  const [data, setData] = useState<HeroMesh | null>(null)
  const [wire, setWire] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    fetch('/landing/hero.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json: HeroMesh) => { if (!cancelled) setData(json) })
      .catch(() => { if (!cancelled) setData(fallbackMesh()) })
    return () => { cancelled = true }
  }, [])

  // Shaded -> hidden-line as the page scrolls; a fixed blend when motion is reduced.
  useEffect(() => {
    if (reduced) { setWire(0.35); return }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setWire(Math.min(1, window.scrollY / 520)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [reduced])

  return (
    <div className="hero-canvas" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 150], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[60, 80, 100]} intensity={1.1} />
        <directionalLight position={[-80, -40, -60]} intensity={0.3} color="#ffffff" />
        {data && <Part data={data} wire={wire} spin={!reduced} />}
      </Canvas>
    </div>
  )
}
