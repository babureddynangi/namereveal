'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ── Floating gold particles ───────────────────────────────────
function GoldParticles({ revealed }) {
  const ref = useRef()
  const count = 2000

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.04
    ref.current.rotation.x = Math.sin(t * 0.02) * 0.1
    // speed up on reveal
    if (revealed) ref.current.rotation.y = t * 0.12
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#c9a84c"
        size={revealed ? 0.035 : 0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={revealed ? 0.9 : 0.5}
      />
    </Points>
  )
}

// ── Slow rotating torus (royal ring) ─────────────────────────
function RoyalRing({ revealed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * 0.15
    ref.current.rotation.z = t * 0.08
    ref.current.scale.setScalar(revealed ? 1.3 : 1)
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.5, 0.015, 16, 120]} />
      <meshStandardMaterial
        color="#c9a84c"
        emissive="#c9a84c"
        emissiveIntensity={revealed ? 1.5 : 0.6}
        transparent opacity={0.4}
      />
    </mesh>
  )
}

// ── Second ring ───────────────────────────────────────────────
function RoyalRing2({ revealed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.1
    ref.current.rotation.x = -t * 0.12
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[4.5, 0.01, 16, 120]} />
      <meshStandardMaterial
        color="#f5e27a"
        emissive="#f5e27a"
        emissiveIntensity={revealed ? 1.2 : 0.3}
        transparent opacity={0.25}
      />
    </mesh>
  )
}

// ── Scene ─────────────────────────────────────────────────────
export default function Scene3D({ revealed }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#c9a84c" />
        <GoldParticles revealed={revealed} />
        <RoyalRing revealed={revealed} />
        <RoyalRing2 revealed={revealed} />
      </Canvas>
    </div>
  )
}
