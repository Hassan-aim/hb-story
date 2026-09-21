import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { heartGeometry, softGlowTexture } from '../../three/shapes'
import { heartbeat } from '../../three/heartbeat'

interface HeartMeshProps {
  size?: number
  interactive?: boolean
  onHeartClick?: () => void
  onHoverChange?: (hovering: boolean) => void
  position?: [number, number, number]
}

/* The living, beating heart at the center of the experience. */
export function HeartMesh({
  size = 1.1,
  interactive = false,
  onHeartClick,
  onHoverChange,
  position = [0, 0, 0],
}: HeartMeshProps) {
  const group = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  const ring = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const geo = useMemo(() => heartGeometry(), [])
  const glowTex = useMemo(() => softGlowTexture(), [])

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!interactive) return
    setHovered(true)
    onHoverChange?.(true)
  }
  const handleOut = () => {
    setHovered(false)
    onHoverChange?.(false)
  }

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const beat = heartbeat.active ? heartbeat.value : 0
    const breathe = Math.sin(t * 1.4) * 0.015
    const targetScale = size * (1 + beat * 0.085 + breathe + (hovered ? 0.06 : 0))
    const g = group.current!
    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 8, 0.05)
    g.scale.set(s, s * (1 - beat * 0.012), s)

    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + beat * 1.6 + (hovered ? 0.9 : 0)
    }
    if (light.current) {
      light.current.intensity = 3 + beat * 6 + (hovered ? 2 : 0)
    }
    if (ring.current) {
      const p = heartbeat.active ? heartbeat.beatPhase : 0
      const rp = (p - 0.02) % 1
      const ringActive = heartbeat.active && rp >= 0
      const prog = ringActive ? Math.min(1, rp / 0.5) : 0
      const ringScale = 1 + prog * 2.1
      ring.current.scale.set(ringScale, ringScale, 1)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.55
    }

    // soft inner pulsing glow sprite
    if (inner.current) {
      const sp = inner.current.children[0]
      if (sp) {
        sp.scale.set(1 + beat * 0.5 + (hovered ? 0.3 : 0), 1 + beat * 0.5 + (hovered ? 0.3 : 0), 1)
        ;(sp as THREE.Sprite).material.opacity = 0.35 + beat * 0.35 + (hovered ? 0.15 : 0)
      }
    }
  })

  return (
    <group position={position} ref={group}>
      <Float
        speed={1.6}
        rotationIntensity={0.08}
        floatIntensity={0.35}
      >
        <group
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={(e) => {
            if (!interactive) return
            e.stopPropagation()
            onHeartClick?.()
          }}
        >
          <mesh geometry={geo} scale={size * 0.88}>
            <meshPhysicalMaterial
              color="#ff4d79"
              emissive="#ff1f5d"
              emissiveIntensity={1.5}
              roughness={0.24}
              metalness={0.32}
              clearcoat={1}
              clearcoatRoughness={0.2}
            />
          </mesh>
          <mesh ref={inner} scale={size * 0.72}>
            <sphereGeometry args={[1, 20, 20]} />
            <meshBasicMaterial color="#ffd9e8" transparent opacity={0.55} toneMapped={false} />
            <sprite scale={[2.6, 2.6, 1]} position={[0, 0, 0]}>
              <spriteMaterial
                map={glowTex}
                transparent
                opacity={0.35}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </mesh>
          <mesh ref={ring} rotation={[0, 0, 0]}>
            <torusGeometry args={[size * 0.62, 0.012, 8, 48]} />
            <meshBasicMaterial
              color="#ff9db8"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>
      <pointLight ref={light} color="#ff4d79" distance={9} decay={2} intensity={3} position={[0, 0, 1.2]} />
      <pointLight color="#ffb3c8" intensity={0.8} distance={6} position={[0, 0, -1.4]} />
    </group>
  )
}