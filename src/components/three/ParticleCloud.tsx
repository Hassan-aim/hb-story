import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function emojiTexture(emoji: string): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  ctx.font = '84px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 64, 66)
  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

export interface ParticleCloudProps {
  emoji?: string
  map?: THREE.Texture
  count: number
  delay: number
  speed: number
  rise?: number
  size: number
  globalTime: { current: number }
  capDistance?: number
  fadeFrom?: number // seconds after which opacity fades out
  fadeOver?: number
  startRadius?: number // particles spawn on a sphere of this radius
  origin?: [number, number, number]
  opacity?: number
  depthWrite?: boolean
  color?: string
}

/* A burst of sprite particles exploding outward from a point. */
export function EmojiCloud({
  emoji,
  map,
  count,
  delay,
  speed,
  rise = 0,
  size,
  globalTime,
  capDistance = 16,
  fadeFrom = 3.4,
  fadeOver = 2.6,
  startRadius = 0,
  origin = [0, 0, 0],
  opacity = 1,
  depthWrite = false,
  color,
}: ParticleCloudProps) {
  const ref = useRef<THREE.Points>(null)
  const tex = useMemo(() => map ?? (emoji ? emojiTexture(emoji) : null), [map, emoji])

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const dir = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const rot = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const mag = 0.4 + Math.random()
      dir[i * 3] = Math.sin(phi) * Math.cos(theta) * mag
      dir[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * mag - Math.random() * 0.2
      dir[i * 3 + 2] = Math.cos(phi) * mag
      spd[i] = speed * (0.35 + Math.random())
      rot[i] = (Math.random() - 0.5) * 0.8
      const r = startRadius * Math.cbrt(Math.random())
      pos[i * 3] = origin[0] + dir[i * 3] * r
      pos[i * 3 + 1] = origin[1] + dir[i * 3 + 1] * r
      pos[i * 3 + 2] = origin[2] + dir[i * 3 + 2] * r
    }
    return { pos, dir, spd, rot }
  }, [count, speed, startRadius, origin])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.pos, 3))
    return g
  }, [data])

  useFrame(() => {
    const t = globalTime.current - delay
    if (t <= 0 || !ref.current) return
    const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const dt = 1 / 60
    const fadeOut = Math.max(0, 1 - Math.max(0, t - fadeFrom) / fadeOver)
    for (let i = 0; i < count; i++) {
      const th = data.rot[i] * dt * 10
      const cos = Math.cos(th)
      const sin = Math.sin(th)
      const ox = p.array[i * 3]
      const oy = p.array[i * 3 + 1]
      const oz = p.array[i * 3 + 2]
      let x = ox * cos - oz * sin
      let z = ox * sin + oz * cos
      x += data.dir[i * 3] * data.spd[i] * dt
      z += data.dir[i * 3 + 2] * data.spd[i] * dt
      let y = oy + (data.dir[i * 3 + 1] * data.spd[i] * 0.8 + rise) * dt
      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > capDistance) {
        const k = capDistance / dist
        x *= k
        y *= k
        z *= k
      }
      p.array[i * 3] = x
      p.array[i * 3 + 1] = y
      p.array[i * 3 + 2] = z
    }
    p.needsUpdate = true
    const mat = ref.current.material as THREE.PointsMaterial
    mat.opacity = Math.min(1, t / 0.14) * fadeOut * opacity
  })

  if (!tex) return null

  return (
    <points ref={ref} geometry={geo} frustumCulled={false} position={origin}>
      <pointsMaterial
        map={tex}
        size={size}
        transparent
        depthWrite={depthWrite}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        opacity={0}
        color={color}
      />
    </points>
  )
}