import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useExperience } from '../../state/experience'
import { heartGeometry, softGlowTexture } from '../../three/shapes'
import { randomInSphere } from '../../three/shapes'

export interface UniverseConfig {
  petals: number
  fireflies: number
  hearts: number
  dust: number
  nebula: boolean
  moon: 'far' | 'close' | 'hidden'
  drift: number // global slow rotation speed
}

/* -------------------------------------------------- helpers */

function mapCount(base: number, high: number, medium: number, low: number): number {
  switch (base) {
    case 3:
      return high
    case 2:
      return medium
    default:
      return low
  }
}

function useInstancedMatrices() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  return { mesh, dummy }
}

/* -------------------------------------------------- Nebula cloud */

function Nebula({ count, radius = 42 }: { count: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  const palette = [
    new THREE.Color('#ff7aa2'),
    new THREE.Color('#a25bff'),
    new THREE.Color('#6a4cff'),
    new THREE.Color('#ff3366'),
    new THREE.Color('#2f1b4d'),
  ]
  useMemo(() => {
    const tmp = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const v = randomInSphere(radius)
      // flatten slightly for a galactic disc feel
      v.y *= 0.45
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      tmp.copy(palette[Math.floor(Math.random() * palette.length)])
      tmp.multiplyScalar(0.55 + Math.random() * 0.45)
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
  }, [count, radius])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [positions, colors])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.004
  })

  return (
    <points ref={ref} geometry={geo} position={[0, 0, -46]}>
      <pointsMaterial
        size={2.6}
        map={softGlowTexture('200,170,220', '160,120,255')}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        vertexColors
      />
    </points>
  )
}

/* -------------------------------------------------- Moon */

function Moon({ scale = 1 }: { scale?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#d8cdc0'
    ctx.fillRect(0, 0, 256, 256)
    // soft blotches to suggest craters
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const r = 4 + Math.random() * 22
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(60,52,48,${0.12 + Math.random() * 0.16})`)
      g.addColorStop(1, 'rgba(60,52,48,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  return (
    <group position={[0, 0, -60]} scale={scale}>
      <mesh>
        <sphereGeometry args={[6, 40, 40]} />
        <meshBasicMaterial map={texture} color="#e8ded2" toneMapped={false} fog={false} />
      </mesh>
      <sprite position={[0, 0, 0.2]} scale={[34, 34, 1]}>
        <spriteMaterial
          map={softGlowTexture('255,230,214', '210,160,180')}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  )
}

/* -------------------------------------------------- Fireflies */

function Fireflies({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const v = randomInSphere(16)
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
      seed[i * 4] = Math.random() * Math.PI * 2
      seed[i * 4 + 1] = 0.3 + Math.random() * 1.2
      seed[i * 4 + 2] = Math.random() * 0.6
      seed[i * 4 + 3] = Math.random()
    }
    return { pos, seed }
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.pos, 3))
    return g
  }, [data])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = ref.current!.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const s = data.seed[i * 4]
      p.array[i * 3] = data.pos[i * 3] + Math.sin(t * data.seed[i * 4 + 1] + s) * 2.4
      p.array[i * 3 + 1] = data.pos[i * 3 + 1] + Math.cos(t * (0.5 + s) + s) * 1.8
      p.array[i * 3 + 2] = data.pos[i * 3 + 2] + Math.sin(t * 0.7 + s * 2) * 2.4
    }
    p.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.16}
        map={softGlowTexture('255,230,180', '255,190,90')}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/* -------------------------------------------------- Petals */

function Petals({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 48
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(18, 10, 2, 24, 24, 18)
    g.addColorStop(0, 'rgba(255,214,234,1)')
    g.addColorStop(0.5, 'rgba(255,122,162,0.9)')
    g.addColorStop(1, 'rgba(255,122,162,0)')
    ctx.fillStyle = g
    ctx.save()
    ctx.translate(24, 24)
    ctx.beginPath()
    ctx.ellipse(0, 0, 8, 14, 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  const data = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34
      pos[i * 3 + 1] = Math.random() * 22 - 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2
      seed[i * 2] = 0.4 + Math.random() * 1.1
      seed[i * 2 + 1] = Math.random() * Math.PI * 2
    }
    return { pos, seed }
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.pos, 3))
    return g
  }, [data])

  useFrame((_, delta) => {
    const p = ref.current!.geometry.attributes.position as THREE.BufferAttribute
    let min = Infinity
    for (let i = 0; i < count; i++) {
      p.array[i * 3 + 1] -= data.seed[i * 2] * delta
      p.array[i * 3] += Math.sin(p.array[i * 3 + 1] * 0.6 + data.seed[i * 2 + 1]) * delta * 0.7
      p.array[i * 3 + 2] += Math.cos(p.array[i * 3 + 1] * 0.4 + data.seed[i * 2 + 1]) * delta * 0.4
      if (p.array[i * 3 + 1] < min) min = p.array[i * 3 + 1]
      if (p.array[i * 3 + 1] < -14) {
        p.array[i * 3 + 1] = 14
        p.array[i * 3] = (Math.random() - 0.5) * 34
        p.array[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2
      }
    }
    p.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.22}
        map={tex}
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

/* -------------------------------------------------- Floating hearts */

function FloatingHearts({ count }: { count: number }) {
  const { mesh, dummy } = useInstancedMatrices()
  const data = useMemo(() => {
    const arr: number[][] = []
    for (let i = 0; i < count; i++) {
      const v = randomInSphere(14)
      arr.push([
        v.x,
        v.y,
        v.z,
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        0.4 + Math.random() * 1.4,
        Math.random() * 0.4 + 0.55,
      ])
    }
    return arr
  }, [count])
  const geometry = useMemo(() => heartGeometry(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const d = data[i]
      dummy.position.set(
        d[0] + Math.sin(t * 0.2 + i) * 1.2,
        d[1] + Math.sin(t * 0.25 + i * 1.7) * 1.4,
        d[2] + Math.cos(t * 0.18 + i) * 1.2,
      )
      dummy.rotation.set(d[4] + t * 0.15, d[3] + t * 0.2, 0)
      const s = d[5]
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    }
    mesh.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined as never, count] as never} frustumCulled={false}>
      <meshStandardMaterial
        color="#ff4d79"
        emissive="#ff2260"
        emissiveIntensity={0.7}
        roughness={0.35}
        metalness={0.15}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}

/* -------------------------------------------------- Gold dust */

function GoldDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const v = randomInSphere(20)
      arr[i * 3] = v.x
      arr[i * 3 + 1] = v.y
      arr[i * 3 + 2] = v.z
    }
    return arr
  }, [count])
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.05}
        color="#ffd9a0"
        map={softGlowTexture('255,224,170', '255,190,120')}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/* -------------------------------------------------- Shooting stars */

function ShootingStars({ count = 3 }: { count?: number }) {
  const ref = useRef<THREE.LineSegments>(null)
  const positions = useMemo(() => new Float32Array(2 * count * 3), [count])
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions, count])

  const state = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        next: Math.random() * 14,
        active: Math.random() > 0.5,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
      })),
    [count],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const arr = ref.current!.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const s = state[i]
      if (!s.active) {
        if (t > s.next) {
          s.active = true
          s.x = (Math.random() - 0.2) * 40
          s.y = 14 + Math.random() * 10
          s.z = -30 - Math.random() * 20
          s.vx = -(6 + Math.random() * 8)
          s.vy = -(2 + Math.random() * 3)
        }
      } else {
        s.x += s.vx * 0.016
        s.y += s.vy * 0.016
        if (s.x < -30 || s.y < -20) {
          s.active = false
          s.next = t + 6 + Math.random() * 14
        }
      }
      const x2 = s.active ? s.x - s.vx * 0.22 : 0
      const y2 = s.active ? s.y - s.vy * 0.22 : 0
      arr[i * 6] = x2
      arr[i * 6 + 1] = y2
      arr[i * 6 + 2] = s.z
      arr[i * 6 + 3] = s.x
      arr[i * 6 + 4] = s.y
      arr[i * 6 + 5] = s.z
    }
    ref.current!.geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial
        color="#ffd9a0"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

/* -------------------------------------------------- Universe root */

export function Universe() {
  const { state, quality } = useExperience()
  const visibleHearts =
    state.phase === 'title' || state.phase === 'intro' || state.phase === 'hb' || state.phase === 'ending'

  const counts = useMemo(() => {
    const q = quality === 'high' ? 3 : quality === 'medium' ? 2 : 1
    return {
      nebula: 700 * q,
      fireflies: mapCount(q, 120, 70, 30),
      petals: mapCount(q, 320, 170, 80),
      hearts: mapCount(q, 20, 12, 6),
      dust: mapCount(q, 1200, 700, 350),
    }
  }, [quality])

  const moonScale = state.phase === 'ending' ? 4 : 1.4

  return (
    <group>
      <Stars radius={90} depth={55} count={counts.nebula && 3200} factor={3.4} saturation={0.4} fade speed={0.6} />
      <Nebula count={counts.nebula} />
      {true && (
        <group key={state.phase}>
          <Moon scale={moonScale} />
        </group>
      )}
      <GoldDust count={counts.dust} />
      <ShootingStars count={3} />
      <group visible={state.phase !== 'explosion' && state.phase !== 'portal'}>
        <Fireflies count={counts.fireflies} />
        <Petals count={counts.petals} />
        {visibleHearts && <FloatingHearts count={counts.hearts} />}
      </group>
    </group>
  )
}