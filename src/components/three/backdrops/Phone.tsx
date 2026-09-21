import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, canvasTexture } from './common'
import { NAMES } from '../../../data/story'

/* Night scene with a floating original social-style phone. */
export function PhoneBackdrop() {
  const group = useRef<THREE.Group>(null)
  const phone = useRef<THREE.Group>(null)
  const rain = useRef<THREE.Points>(null)

  const screenTex = useMemo(
    () =>
      canvasTexture((ctx, w, h) => {
        ctx.fillStyle = '#10131f'
        ctx.fillRect(0, 0, w, h)
        // header
        ctx.fillStyle = '#1b2030'
        ctx.fillRect(0, 0, w, 44)
        ctx.fillStyle = '#ff5d87'
        ctx.beginPath()
        ctx.arc(26, 22, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText('hassan', 46, 30)
        // notification card (follow request)
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(12, 60, w - 24, 108)
        ctx.strokeStyle = 'rgba(255,122,162,0.35)'
        ctx.lineWidth = 1
        ctx.strokeRect(12, 60, w - 24, 108)
        ctx.fillStyle = '#ff7aa2'
        ctx.beginPath()
        ctx.arc(40, 100, 20, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '600 21px sans-serif'
        ctx.fillText(NAMES.full, 66, 92)
        ctx.font = '16px sans-serif'
        ctx.fillText('sent you a follow request', 66, 118)
        // buttons
        ctx.fillStyle = '#ff3b6b'
        ctx.beginPath()
        ctx.arc(w - 90, 118, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText('✓', w - 90, 124)
        // reply bubble
        ctx.fillStyle = '#2a2f45'
        ctx.beginPath()
        ctx.ellipse(40, 180, 26, 15, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#cfd6ea'
        ctx.font = '17px sans-serif'
        ctx.fillText('hey 😊', 24, 186)
        // typing dots
        ctx.fillStyle = '#ff7aa2'
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.arc(w - 30 - i * 16, 250, 4, 0, Math.PI * 2)
          ctx.fill()
        }
        // time
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '14px sans-serif'
        ctx.fillText('2:47', 12, 304)
      }, 300, 300),
    [],
  )

  const rainData = useMemo(() => {
    const n = 600
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = Math.random() * 20 - 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
      seed[i] = 12 + Math.random() * 10
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
    c.height = 96
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 96)
    g.addColorStop(0, 'rgba(180,200,255,0)')
    g.addColorStop(1, 'rgba(180,200,255,0.6)')
    ctx.fillStyle = g
    ctx.fillRect(6, 0, 4, 96)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) group.current.rotation.y = Math.sin(t * 0.25) * 0.22
    if (phone.current) {
      phone.current.position.y = Math.sin(t * 0.9) * 0.12
      phone.current.rotation.z = Math.sin(t * 0.5) * 0.05
    }
    if (rain.current) {
      const p = rain.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < rainData.count; i++) {
        p.array[i * 3 + 1] -= rainData.seed[i] * (1 / 60)
        if (p.array[i * 3 + 1] < -5) {
          p.array[i * 3 + 1] = 15
          p.array[i * 3] = (Math.random() - 0.5) * 30
        }
      }
      p.needsUpdate = true
    }
  })

  // city skyline blocks
  const skyline = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        x: (Math.random() - 0.5) * 120,
        z: -22 - Math.random() * 14,
        w: 2 + Math.random() * 3,
        h: 3 + Math.random() * 7,
        lit: Math.random() > 0.5,
      })),
    [],
  )

  return (
    <group>
      <Sky top="#04060f" mid="#0b1030" horizon="#1a1440" sun={[0, 30, -40]} sunColor="#ffa07a" sunStrength={0.12} />
      <ambientLight intensity={0.3} color="#8aa0ff" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#88a0ff" distance={12} />

      {/* city skyline silhouettes */}
      {skyline.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2 - 5, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, 1]} />
            <meshStandardMaterial color="#0a0d1c" roughness={1} />
          </mesh>
          {b.lit && (
            <mesh position={[0, b.h / 2 - 0.6, 0.55]}>
              <planeGeometry args={[b.w * 0.55, b.h * 0.4]} />
              <meshBasicMaterial color="#ffca8a" transparent opacity={0.25} />
            </mesh>
          )}
        </group>
      ))}

      {/* floating phone */}
      <group ref={group} position={[0, 0.5, 0.4]}>
        <group ref={phone} position={[0, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.15, 3.9, 0.28]} />
            <meshStandardMaterial color="#202433" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.145]}>
            <planeGeometry args={[1.96, 3.66]} />
            <meshStandardMaterial map={screenTex} emissive="#5a5a8a" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, -0.15]}>
            <planeGeometry args={[2.15, 3.9]} />
            <meshStandardMaterial color="#14141f" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* soft screen glow in front */}
      <sprite position={[0, 0.5, 1.9]} scale={[5, 6, 1]}>
        <spriteMaterial map={screenTex} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <points ref={rain} geometry={rainGeo}>
        <pointsMaterial map={streakTex} size={0.3} transparent opacity={0.55} depthWrite={false} sizeAttenuation color="#9fb8ff" />
      </points>
    </group>
  )
}