import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Ground, Tree, Birds, canvasTexture, Glow } from './common'
import { useExperience } from '../../../state/experience'

/* Golden afternoon at a Hyderabad training campus. */
export function CampusBackdrop() {
  const { quality } = useExperience()
  const butterflies = useRef<THREE.Points>(null)
  const pollen = useRef<THREE.Points>(null)

  const trees = useMemo(() => {
    const arr: Array<[number, number, number, number]> = []
    for (let i = 0; i < 22; i++) {
      const side = i % 2 === 0 ? -1 : 1
      arr.push([side * (14 + Math.random() * 26), -1.4, -8 - Math.random() * 18, 1.6 + Math.random() * 1.4])
    }
    return arr
  }, [])

  const flowers = useMemo(() => {
    const arr: Array<[number, number, number, string]> = []
    const cols = ['#ff7aa2', '#ff4d79', '#ffd9a0', '#e8b4a0']
    for (let i = 0; i < 60; i++) {
      arr.push([
        (Math.random() - 0.5) * 22,
        -1.3,
        -1 - Math.random() * 6,
        cols[i % cols.length],
      ])
    }
    return arr
  }, [])

  const butterflyData = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        x: (Math.random() - 0.4) * 14,
        y: 0.5 + Math.random() * 3.4,
        z: -1 - Math.random() * 5,
        seed: Math.random() * 10,
        col: Math.random() > 0.5 ? '#ffb6d3' : '#ffd9a0',
      })),
    [],
  )

  const pollenData = useMemo(() => {
    const pos = new Float32Array(quality === 'low' ? 120 : 340 * (quality === 'high' ? 1 : 0.6) * 2)
    const seed = new Float32Array(quality === 'low' ? 120 : 340 * (quality === 'high' ? 1 : 0.6) * 2)
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = Math.random() * 8 - 1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
      seed[i] = Math.random() * Math.PI * 2
    }
    return { pos, seed, count: pos.length / 3 }
  }, [quality])

  const pollenGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pollenData.pos, 3))
    return g
  }, [pollenData])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (pollen.current) {
      const p = pollen.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pollenData.count; i++) {
        p.array[i * 3 + 1] += Math.sin(t * 0.6 + pollenData.seed[i]) * 0.002
        p.array[i * 3] += Math.cos(t * 0.4 + pollenData.seed[i]) * 0.0018
      }
      p.needsUpdate = true
    }
    if (butterflies.current) {
      const p = butterflies.current.geometry.attributes.position as THREE.BufferAttribute
      butterflyData.forEach((b, i) => {
        p.array[i * 3] = b.x + Math.sin(t * 0.8 + b.seed) * 2.2
        p.array[i * 3 + 1] = b.y + Math.sin(t * 1.4 + b.seed) * 1.1
        p.array[i * 3 + 2] = b.z + Math.cos(t * 0.6 + b.seed) * 1.4
      })
      p.needsUpdate = true
    }
  })

  const buildingTex = useMemo(
    () =>
      canvasTexture((ctx, w, h) => {
        ctx.fillStyle = '#c9b9a2'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#8a7561'
        ctx.fillRect(0, 0, w, 14)
        ctx.fillRect(0, h - 10, w, 10)
        const rows = 3
        const cols = 4
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 20 + (c * (w - 40)) / cols + 8
            const y = 22 + (r * (h - 70)) / rows + 8
            const lit = (r + c * 3) % 3 === 0
            ctx.fillStyle = lit ? '#7a5c3a' : '#b7a892'
            ctx.fillRect(x, y, (w - 40) / cols - 16, (h - 70) / rows - 16)
          }
        }
      }, 128, 96),
    [],
  )

  return (
    <group>
      <Sky
        top="#2a1630"
        mid="#e8a15c"
        horizon="#ffd9a0"
        sun={[12, 16, -20]}
        sunColor="#fff1d6"
        sunStrength={0.7}
      />
      <Ground color="#5c7a4a" />
      <ambientLight intensity={0.55} color="#ffd9b0" />
      <directionalLight position={[14, 18, -6]} intensity={2.2} color="#ffcf9e" />
      <directionalLight position={[-10, 6, 8]} intensity={0.35} color="#ff9ec2" />

      {/* campus building */}
      <group position={[-7, -1.5, -26]}>
        <mesh>
          <boxGeometry args={[18, 10, 8]} />
          <meshStandardMaterial color="#c9b9a2" roughness={0.9} />
        </mesh>
        {[-6, 0, 6].map((x) => (
          <mesh key={x} position={[x, 1.4, 4.02]}>
            <planeGeometry args={[8.5, 6.2]} />
            <meshStandardMaterial map={buildingTex} emissive="#5a4632" emissiveMap={buildingTex} emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>

      {/* trees */}
      {trees.map((t, i) => (
        <Tree key={i} position={[t[0], t[1], t[2]]} scale={t[3]} />
      ))}

      {/* flowers */}
      {flowers.map((f, i) => (
        <mesh key={i} position={[f[0], f[1], f[2]]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={f[3]} emissive={f[3]} emissiveIntensity={0.5} roughness={0.6} />
        </mesh>
      ))}

      {/* butterflies - springy glowing specks */}
      {butterflyData.map((b, i) => (
        <Glow key={i} position={[b.x, b.y, b.z]} color={b.col} scale={0.5} opacity={0.8} />
      ))}

      {/* pollen */}
      <points ref={pollen} geometry={pollenGeo}>
        <pointsMaterial size={0.045} color="#fff2cf" transparent opacity={0.7} depthWrite={false} sizeAttenuation />
      </points>

      <Birds count={4} region={[14, 10, -22]} />
    </group>
  )
}