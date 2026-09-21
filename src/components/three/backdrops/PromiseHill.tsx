import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Birds } from './common'

/* The promise — golden hill at dusk, two silhouettes holding hands. */
export function PromiseHillBackdrop() {
  const clouds = useRef<THREE.Group>(null)
  const group = useRef<THREE.Group>(null)

  const cloudsData = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        x: (Math.random() - 0.5) * 30,
        y: 4 + Math.random() * 5,
        z: -8 - Math.random() * 12,
        s: 3 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.6,
      })),
    [],
  )

  const cloudTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    for (let i = 0; i < 42; i++) {
      const x = Math.random() * 256
      const y = 90 + Math.random() * 100
      const r = 20 + Math.random() * 42
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(255,220,200,0.16)')
      g.addColorStop(1, 'rgba(255,220,200,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (clouds.current) {
      clouds.current.children.forEach((c, i) => {
        const data = cloudsData[i % cloudsData.length]
        c.position.x = data.x + Math.sin(t * data.speed + i * 1.7) * 2.4
        c.position.y = data.y + Math.sin(t * 0.4 + i) * 0.4
      })
    }
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.14) * 0.06
    }
  })

  // stylized, non-uncanny silhouetted figures holding hands
  return (
    <group>
      <Sky top="#241035" mid="#7a2850" horizon="#ff8a5c" sun={[-3, 2.2, -30]} sunColor="#fff1c9" sunStrength={1.0} />

      <ambientLight intensity={0.55} color="#ffb49a" />
      <directionalLight position={[-6, 4, 6]} intensity={0.8} color="#ff9e6a" />

      {/* ground — rolling hill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, -8]}>
        <circleGeometry args={[60, 40]} />
        <meshStandardMaterial color="#1f1626" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -1.45, -9]}>
        <circleGeometry args={[9, 28]} />
        <meshStandardMaterial color="#2a1c2c" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, -1.35, -12]}>
        <circleGeometry args={[13, 30]} />
        <meshStandardMaterial color="#251a2a" roughness={0.95} />
      </mesh>

      {/* sun */}
      <mesh position={[-3, 2.4, -26]}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#fff0c4" toneMapped={false} fog={false} />
      </mesh>

      {/* golden clouds */}
      <group ref={clouds}>
        {cloudsData.map((c, i) => (
          <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s * 2, c.s, 1]}>
            <spriteMaterial map={cloudTex} transparent opacity={0.8} depthWrite={false} rotation={0.1} />
          </sprite>
        ))}
      </group>

      {/* TWO SILHOUETTES holding hands */}
      <group ref={group} position={[0.6, -1.5, -4.4]} scale={1.05}>
        {/* Hassan (left) */}
        <group position={[-0.55, 0, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.22, 1.05, 6, 12]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[-0.18, 0.55, 0]} rotation={[0.5, 0, 0.25]}>
            <capsuleGeometry args={[0.09, 0.5, 5, 10]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[0.24, 0.12, 0]} rotation={[0, 0, 0.35]}>
            <capsuleGeometry args={[0.09, 0.55, 5, 10]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
        </group>
        {/* joined hands */}
        <mesh position={[0, 0.72, 0]}>
          <capsuleGeometry args={[0.1, 0.2, 4, 8]} />
          <meshStandardMaterial color="#0d0912" roughness={0.9} />
        </mesh>
        {/* Bhagi (right) */}
        <group position={[0.62, 0, 0]}>
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          {/* long hair silhouette */}
          <mesh position={[0, 0.88, -0.05]}>
            <sphereGeometry args={[0.31, 16, 16]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <coneGeometry args={[0.44, 1.25, 12]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, -0.25]}>
            <capsuleGeometry args={[0.08, 0.5, 5, 10]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
          <mesh position={[0.16, 0.15, 0]} rotation={[0, 0, 0.6]}>
            <capsuleGeometry args={[0.08, 0.55, 5, 10]} />
            <meshStandardMaterial color="#0d0912" roughness={0.9} />
          </mesh>
        </group>
      </group>

      <Birds count={4} region={[10, 7, -14]} />

      {/* wind sweep particles near the figures */}
      <GoldenWind />
    </group>
  )
}

function GoldenWind() {
  const ref = useRef<THREE.Points>(null)
  const data = useMemo(() => {
    const n = 60
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8 + 0.5
      pos[i * 3 + 1] = Math.random() * 5 - 1
      pos[i * 3 + 2] = -1 - Math.random() * 4
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
      const n = p.count
      for (let i = 0; i < n; i++) {
        p.array[i * 3] += 0.9 * delta
        if (p.array[i * 3] > 3.5) {
          p.array[i * 3] = -3.5
          p.array[i * 3 + 1] = -1 + Math.random() * 5
        }
      }
      p.needsUpdate = true
    }
  })

  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 24
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(12, 12, 0, 12, 12, 12)
    g.addColorStop(0, 'rgba(255,224,170,1)')
    g.addColorStop(1, 'rgba(255,200,140,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 24, 24)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  return (
    <points ref={ref} geometry={data}>
      <pointsMaterial map={tex} size={0.12} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}