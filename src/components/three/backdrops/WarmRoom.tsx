import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Glow } from './common'

/* Warm togetherness — dusk window, lamps, coffee, easy comfort. */
export function WarmRoomBackdrop() {
  const dust = useRef<THREE.Points>(null)

  const dustGeo = useMemo(() => {
    const n = 220
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = -1 - Math.random() * 5
      seed[i] = Math.random() * Math.PI * 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.userData.n = n
    g.userData.seed = seed
    return g
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (dust.current) {
      const p = dust.current.geometry.attributes.position as THREE.BufferAttribute
      const n = dust.current.geometry.userData.n as number
      const seed = dust.current.geometry.userData.seed as Float32Array
      for (let i = 0; i < n; i++) {
        p.array[i * 3 + 1] += Math.sin(t * 0.5 + seed[i]) * 0.0015
        p.array[i * 3] += Math.cos(t * 0.4 + seed[i]) * 0.0012
      }
      p.needsUpdate = true
    }
  })

  const dustTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,240,210,1)')
    g.addColorStop(1, 'rgba(255,230,190,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  return (
    <group>
      <Sky top="#201222" mid="#4a2036" horizon="#c05a3a" sun={[3, 2.6, -12]} sunColor="#ffd9a0" sunStrength={0.55} />
      <ambientLight intensity={0.45} color="#ffb49a" />
      <directionalLight position={[4, 6, 4]} intensity={0.6} color="#ffc49a" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <circleGeometry args={[16, 32]} />
        <meshStandardMaterial color="#241722" roughness={0.9} />
      </mesh>

      {/* back wall glow of dusk window */}
      <mesh position={[0, 1.2, -6]}>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#3a2038" roughness={0.8} />
      </mesh>
      <mesh position={[3.4, 2.6, -5.95]}>
        <planeGeometry args={[4.4, 5.2]} />
        <meshBasicMaterial color="#ffb46b" transparent opacity={0.4} toneMapped={false} />
      </mesh>

      {/* sofa silhouette */}
      <group position={[-1.4, -1.1, -3.2]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[3.4, 1.15, 1.1]} />
          <meshStandardMaterial color="#14101c" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.9, 0.42]}>
          <boxGeometry args={[3.4, 0.55, 0.3]} />
          <meshStandardMaterial color="#1a1424" roughness={0.85} />
        </mesh>
        <mesh position={[-1.6, 0.55, 0.05]}>
          <boxGeometry args={[0.4, 1.4, 1.05]} />
          <meshStandardMaterial color="#14101c" roughness={0.85} />
        </mesh>
        <mesh position={[1.6, 0.55, 0.05]}>
          <boxGeometry args={[0.4, 1.4, 1.05]} />
          <meshStandardMaterial color="#14101c" roughness={0.85} />
        </mesh>
      </group>

      {/* lamps */}
      {[1.8, 3.4].map((x) => (
        <group key={x} position={[x, -1.9, -1.4]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 1, 6]} />
            <meshStandardMaterial color="#181422" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#ffdfa0" emissive="#ffdfa0" emissiveIntensity={0.9} />
          </mesh>
          <Glow position={[0, 1.05, 0]} color="#ffd9a0" scale={1.7} opacity={0.5} />
        </group>
      ))}

      {/* coffee table + mugs */}
      <group position={[0.4, -2, -2.1]}>
        <mesh>
          <boxGeometry args={[1.4, 0.08, 0.9]} />
          <meshStandardMaterial color="#1f1826" roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 0.15, 0.25]}>
          <cylinderGeometry args={[0.1, 0.09, 0.22, 10]} />
          <meshStandardMaterial color="#3a2a34" roughness={0.5} />
        </mesh>
        <mesh position={[-0.4, 0.15, -0.2]}>
          <cylinderGeometry args={[0.1, 0.09, 0.22, 10]} />
          <meshStandardMaterial color="#4a3040" roughness={0.5} />
        </mesh>
      </group>

      {/* floating dust */}
      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial map={dustTex} size={0.08} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  )
}