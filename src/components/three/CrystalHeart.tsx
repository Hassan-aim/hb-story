import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { heartGeometry } from '../../three/shapes'
import { heartbeat } from '../../three/heartbeat'

interface CrystalHeartProps {
  size?: number
  interactive?: boolean
  onHeartClick?: () => void
}

/* Giant glass heart with HB suspended inside. */
export function CrystalHeart({ size = 2.6, interactive = false, onHeartClick }: CrystalHeartProps) {
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  const group = useRef<THREE.Group>(null)
  const geo = useMemo(() => heartGeometry(), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(heartGeometry(), 0.15), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const beat = heartbeat.active ? heartbeat.value : 0

    if (group.current) {
      group.current.rotation.y += 0.0016 + beat * 0.004
      const slow = Math.sin(t * 0.5) * 0.05
      group.current.rotation.z = slow
    }
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = 0.7 + beat * 1.1
    }
    if (core.current) {
      const coreMat = core.current.material as THREE.MeshBasicMaterial
      coreMat.opacity = 0.75 + beat * 0.25
      const s = 0.34 * (1 + beat * 0.06)
      core.current.scale.set(s, s, s)
      // pull core point-light with the pulse
      light.current!.intensity = 6 + beat * 7
    }
  })

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    ;(outer.current!.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.4
  }
  const handleOut = () => {
    ;(outer.current!.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0
  }

  return (
    <group ref={group}>
      <mesh
        ref={outer}
        geometry={geo}
        scale={size}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={(e) => {
          if (!interactive) return
          e.stopPropagation()
          onHeartClick?.()
        }}
      >
        <meshPhysicalMaterial
          color="#fff5f8"
          transparent
          opacity={0.28}
          transmission={0.62}
          thickness={1.4}
          roughness={0.06}
          metalness={0.12}
          ior={1.42}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor="#ff8fae"
          attenuationDistance={2.4}
          emissive="#ff5d87"
          emissiveIntensity={0}
          envMapIntensity={1.4}
        />
      </mesh>

      <lineSegments geometry={edges} scale={size}>
        <lineBasicMaterial color="#ffd9a0" transparent opacity={0.5} toneMapped={false} />
      </lineSegments>

      <mesh ref={inner} geometry={geo} scale={size * 0.86}>
        <meshPhysicalMaterial
          color="#ffd0de"
          emissive="#ff2260"
          emissiveIntensity={0.7}
          transparent
          opacity={0.34}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={core} scale={0.34}>
        <primitive object={geo} attach="geometry" />
        <meshBasicMaterial color="#ffd9e8" transparent opacity={0.85} toneMapped={false} />
      </mesh>

      <Sparkles count={90} scale={size * 1.7} size={5} speed={0.4} color="#ffd9e8" opacity={0.8} />
      <Sparkles count={40} scale={size * 1.3} size={3} speed={0.6} color="#ffd9a0" opacity={0.9} />

      <pointLight ref={light} color="#ff4d79" intensity={6} distance={14} decay={2} position={[0, 0, 0.6]} />
    </group>
  )
}