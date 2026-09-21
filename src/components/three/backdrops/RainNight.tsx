import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Ground, Glow } from './common'

/* The night it rained — streetlights, wet road, fog, slow rain. */
export function RainNightBackdrop() {
  const rain = useRef<THREE.Points>(null)
  const bokeh = useRef<THREE.Points>(null)

  const rainData = useMemo(() => {
    const n = 900
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = Math.random() * 18 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26 - 3
      seed[i] = 14 + Math.random() * 12
    }
    return { pos, seed, count: n }
  }, [])

  const rainGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(rainData.pos, 3))
    return g
  }, [rainData])

  const streakTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 16
    c.height = 120
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 120)
    g.addColorStop(0, 'rgba(150,180,255,0)')
    g.addColorStop(1, 'rgba(150,180,255,0.55)')
    ctx.fillStyle = g
    ctx.fillRect(6, 0, 4, 120)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  const bokehData = useMemo(() => {
    const n = 90
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34
      pos[i * 3 + 1] = 0.5 + Math.random() * 9
      pos[i * 3 + 2] = -8 - Math.random() * 12
      const c = i % 3 === 0 ? [1, 0.45, 0.2] : i % 3 === 1 ? [1, 0.7, 0.4] : [1, 0.8, 0.65]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])

  // soft defocused light dots
  const softTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,210,160,1)')
    g.addColorStop(0.4, 'rgba(255,190,140,0.4)')
    g.addColorStop(1, 'rgba(255,190,140,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (rain.current) {
      const p = rain.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < rainData.count; i++) {
        p.array[i * 3 + 1] -= rainData.seed[i] * (1 / 60)
        if (p.array[i * 3 + 1] < -4) {
          p.array[i * 3 + 1] = 16
          p.array[i * 3] = (Math.random() - 0.5) * 40
        }
      }
      p.needsUpdate = true
    }
    if (bokeh.current) {
      const p = bokeh.current.geometry.attributes.position as THREE.BufferAttribute
      const n = bokeh.current.geometry.attributes.position.count
      for (let i = 0; i < n; i++) {
        p.array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.0006
      }
      p.needsUpdate = true
    }
  })

  return (
    <group>
      <Sky top="#02030a" mid="#0a0e22" horizon="#151a3a" sun={[0, 20, -30]} sunColor="#ff8a6b" sunStrength={0.06} />
      <fog attach="fog" args={['#05070f', 10, 42]} />
      <ambientLight intensity={0.28} color="#6a7cff" />
      <Ground color="#0a0d18" />

      {/* wet road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, -12]}>
        <planeGeometry args={[120, 60]} />
        <meshStandardMaterial color="#10141f" roughness={0.18} metalness={0.6} />
      </mesh>

      {/* streetlight poles */}
      {[0, 9, -9, 16, -16].map((x, i) => (
        <group key={i} position={[x, 0, -6]}>
          <mesh position={[0, 3.4, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 6.8, 6]} />
            <meshStandardMaterial color="#1c2030" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 6.9, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#ffd9a0" emissive="#ffd9a0" emissiveIntensity={2} />
          </mesh>
          <Glow position={[0, 6.9, 0]} color="#ffc98a" scale={2.2} opacity={0.55} />
          <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.4, 24]} />
            <meshBasicMaterial color="#ffc98a" transparent opacity={0.05} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* bokeh lights */}
      <points ref={bokeh} geometry={bokehData}>
        <pointsMaterial map={softTex} size={1.2} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} vertexColors sizeAttenuation />
      </points>

      <points ref={rain} geometry={rainGeo}>
        <pointsMaterial map={streakTex} size={0.32} transparent opacity={0.6} depthWrite={false} sizeAttenuation color="#a8bfff" />
      </points>
    </group>
  )
}