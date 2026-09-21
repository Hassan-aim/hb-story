import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, canvasTexture } from './common'
import { useExperience } from '../../../state/experience'

interface CardSeed {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  speed: number
  phase: number
}

const PHOTOS: Array<{ title: string; sub: string; c1: string; c2: string }> = [
  { title: 'Good morning', sub: 'every single day', c1: '#ffd9a0', c2: '#ff7aa2' },
  { title: '3:47 AM', sub: 'still talking…', c1: '#6a4cff', c2: '#2a0f33' },
  { title: 'missed call', sub: 'call me when you wake', c1: '#4c7aff', c2: '#16223f' },
  { title: 'study date 📚', sub: 'both of us, together', c1: '#ffb46b', c2: '#7a3a2a' },
  { title: 'rain walk', sub: 'under one tiny umbrella', c1: '#8ab4ff', c2: '#2a3a6a' },
  { title: 'inside joke', sub: 'you had to be there', c1: '#ff8fb0', c2: '#5a1428' },
  { title: 'sunset selfie', sub: 'no filter needed', c1: '#ffd95a', c2: '#c94a4a' },
  { title: 'late dinner', sub: 'dosa and chaos', c1: '#ffc46b', c2: '#7a4a1a' },
  { title: 'typing…', sub: 'that little bubble ♥', c1: '#9a8aff', c2: '#221747' },
]

function polaroidTexture(photo: (typeof PHOTOS)[number]): THREE.Texture {
  return canvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#f5f0ea'
      ctx.fillRect(0, 0, w, h)
      // photo area
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, photo.c1)
      g.addColorStop(1, photo.c2)
      ctx.fillStyle = g
      ctx.fillRect(14, 14, w - 28, h - 74)
      // soft light flare
      const flare = ctx.createRadialGradient(w * 0.7, h * 0.25, 2, w * 0.7, h * 0.25, w * 0.4)
      flare.addColorStop(0, 'rgba(255,255,255,0.5)')
      flare.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = flare
      ctx.fillRect(14, 14, w - 28, h - 74)
      // caption
      ctx.fillStyle = '#20181c'
      ctx.font = '700 22px "Playfair Display", serif'
      ctx.fillText(photo.title, 16, h - 34 + 6)
      ctx.font = '18px "Poppins", sans-serif'
      ctx.fillStyle = '#6a5a62'
      ctx.fillText(photo.sub, 16, h - 12)
    },
    240,
    300,
  )
}

export function MontageBackdrop() {
  const { quality } = useExperience()
  const group = useRef<THREE.Group>(null)
  const bokeh = useRef<THREE.Points>(null)

  const seeds = useMemo<CardSeed[]>(() => {
    const count = quality === 'low' ? 8 : 12
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 11 + (i % 2 === 0 ? -2 : 2),
      y: (Math.random() - 0.5) * 5.4,
      z: -1.5 - Math.random() * 5,
      rx: (Math.random() - 0.5) * 0.7,
      ry: (Math.random() - 0.5) * 0.9,
      rz: (Math.random() - 0.5) * 0.5,
      speed: 0.16 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [quality])

  const cards = useMemo(
    () =>
      PHOTOS.slice(0, quality === 'low' ? 8 : PHOTOS.length).map((p, i) => ({
        tex: polaroidTexture(p),
        seed: seeds[i % seeds.length],
      })),
    [seeds, quality],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    cards.forEach((card, i) => {
      const node = group.current?.children[i]
      if (!node) return
      const s = card.seed
      node.position.set(
        s.x + Math.sin(t * s.speed + s.phase) * 0.8,
        s.y + Math.cos(t * s.speed * 0.8 + s.phase) * 0.6,
        s.z,
      )
      node.rotation.set(
        s.rx + Math.sin(t * 0.35 + i) * 0.08,
        s.ry + t * 0.12,
        s.rz + Math.sin(t * 0.5 + i) * 0.1,
      )
    })
  })

  const bokehTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,210,190,1)')
    g.addColorStop(0.5, 'rgba(255,180,190,0.35)')
    g.addColorStop(1, 'rgba(255,180,190,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  const bokehPos = useMemo(() => {
    const n = 140 * (quality === 'low' ? 0.5 : 1)
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = -3 - Math.random() * 14
    }
    return arr
  }, [quality])

  const bokehGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3))
    return g
  }, [bokehPos])

  useFrame(() => {
    if (bokeh.current) {
      bokeh.current.rotation.z += 0.0004
      bokeh.current.rotation.y += 0.0003
    }
  })

  return (
    <group>
      <Sky top="#1f0d24" mid="#43183a" horizon="#7a2f4a" sun={[0, 10, -30]} sunColor="#ffb46b" sunStrength={0.2} />
      <ambientLight intensity={0.5} color="#ff9eb2" />
      <directionalLight position={[0, 8, 4]} intensity={1.1} color="#ffd9c0" />

      <group ref={group}>
        {cards.map((c, i) => (
          <mesh key={i} position={[c.seed.x, c.seed.y, c.seed.z]}>
            <planeGeometry args={[1.7, 2.12]} />
            <meshStandardMaterial map={c.tex} roughness={0.7} metalness={0.05} side={THREE.DoubleSide} emissive="#ffffff" emissiveIntensity={0.05} />
          </mesh>
        ))}
      </group>

      <points ref={bokeh} geometry={bokehGeo}>
        <pointsMaterial map={bokehTex} size={1.4} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  )
}