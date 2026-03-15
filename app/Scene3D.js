'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ── Supersonic particle ring ──────────────────────────────────
function SonicParticles({ revealed }) {
  const ref = useRef()
  const count = 3000

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // ring / disc shape
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 6
      const spread = (Math.random() - 0.5) * 1.5
      arr[i * 3]     = Math.cos(angle) * radius
      arr[i * 3 + 1] = spread
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * (revealed ? 0.6 : 0.15)
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.2
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={revealed ? '#00f5ff' : '#0080ff'}
        size={revealed ? 0.04 : 0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={revealed ? 1 : 0.6}
      />
    </Points>
  )
}

// ── Speed ring ────────────────────────────────────────────────
function SpeedRing({ radius, speed, color, revealed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.z = t * speed
    ref.current.rotation.x = t * speed * 0.4
    ref.current.scale.setScalar(revealed ? 1.4 : 1)
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.012, 16, 200]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={revealed ? 3 : 1}
        transparent opacity={0.5}
      />
    </mesh>
  )
}

// ── Sonic boom sphere (on reveal) ────────────────────────────
function SonicBoom({ revealed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    if (revealed) {
      ref.current.scale.setScalar(1 + Math.sin(t * 4) * 0.05)
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(t * 6) * 0.3
    }
  })
  if (!revealed) return null
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={0.5}
        transparent opacity={0.08}
        wireframe
      />
    </mesh>
  )
}

export default function Scene3D({ revealed }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 5]} intensity={3} color="#00f5ff" />
        <pointLight position={[0, 0, -5]} intensity={2} color="#bf00ff" />
        <SonicParticles revealed={revealed} />
        <SpeedRing radius={4}   speed={0.3}  color="#00f5ff" revealed={revealed} />
        <SpeedRing radius={5.5} speed={-0.2} color="#bf00ff" revealed={revealed} />
        <SpeedRing radius={3}   speed={0.5}  color="#0080ff" revealed={revealed} />
        <SonicBoom revealed={revealed} />
      </Canvas>
    </div>
  )
}
