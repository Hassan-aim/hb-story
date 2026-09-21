import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Glow } from './common'
import { useExperience } from '../../../state/experience'

/* Sunset sea — acceptance. The sky burns gold, then the stars arrive. */
export function SunsetSeaBackdrop() {
  const { quality } = useExperience()
  const sparkle = useRef<THREE.Points>(null)
  const fw = useRef<THREE.Points>(null)

  const sunGlow = useRef<THREE.Mesh>(null)

  const sparkleData = useMemo(() => {
    const n = (quality === 'high' ? 500 : quality === 'medium' ? 260 : 120)
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = 0.4 + Math.random() * 2
      pos[i * 3 + 2] = -2 - Math.random() * 40
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [quality])

  const sparkleTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,255,230,1)')
    g.addColorStop(1, 'rgba(255,220,160,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  // Fireworks — simple rocket points that re-arm
  const fireCount = quality === 'high' ? 90 : quality === 'medium' ? 50 : 26
  const fireData = useMemo(() => {
    const pos = new Float32Array(fireCount * 3)
    const vel = new Float32Array(fireCount * 3)
    const life = new Float32Array(fireCount)
    const maxLife = new Float32Array(fireCount)
    return { pos, vel, life, maxLife, count: fireCount }
  }, [fireCount])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (sparkle.current) {
      sparkle.current.rotation.y += dt * 0.004
    }
    if (fw.current) {
      const p = fw.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < fireCount; i++) {
        fireData.life[i] += dt
        if (fireData.life[i] >= fireData.maxLife[i]) {
          // respawn at a random sky position
          fireData.pos[i * 3] = (Math.random() - 0.5) * 40
          fireData.pos[i * 3 + 1] = 2 + Math.random() * 8
          fireData.pos[i * 3 + 2] = -12 - Math.random() * 16
          fireData.vel[i * 3] = (Math.random() - 0.5) * 7
          fireData.vel[i * 3 + 1] = (Math.random() - 0.5) * 5 - 0.8
          fireData.vel[i * 3 + 2] = (Math.random() - 0.5) * 6
          fireData.life[i] = 0
          fireData.maxLife[i] = 1.4 + Math.random() * 1.6
        }
        fireData.pos[i * 3] += fireData.vel[i * 3] * dt
        fireData.pos[i * 3 + 1] += fireData.vel[i * 3 + 1] * dt
        fireData.pos[i * 3 + 2] += fireData.vel[i * 3 + 2] * dt
        fireData.pos[i * 3 + 1] -= dt * 2.2 // gravity
        p.array[i * 3] = fireData.pos[i * 3]
        p.array[i * 3 + 1] = fireData.pos[i * 3 + 1]
        p.array[i * 3 + 2] = fireData.pos[i * 3 + 2]
      }
      p.needsUpdate = true
      const prog = 1 - fireData.life[0] / Math.max(0.1, fireData.maxLife[0])
      ;(fw.current.material as THREE.PointsMaterial).opacity = 0.4 + Math.max(0, prog) * 0.6
    }
    if (sunGlow.current) {
      sunGlow.current.scale.setScalar(1 + Math.sin(performance.now() * 0.0008) * 0.04)
    }
  })

  const sky = useMemo(
    () => ({ top: '#1a0d2e', mid: '#7a1f3d', horizon: '#ff8a5c' }),
    [],
  )

  return (
    <group>
      <Sky top={sky.top} mid={sky.mid} horizon={sky.horizon} sun={[1, 3.2, -40]} sunColor="#ffe9b0" sunStrength={1.1} />
      <ambientLight intensity={0.5} color="#ffb49a" />

      {/* sun */}
      <mesh ref={sunGlow} position={[1, 3.4, -38]}>
        <sphereGeometry args={[2.4, 24, 24]} />
        <meshBasicMaterial color="#fff3c9" toneMapped={false} fog={false} />
      </mesh>
      <Glow position={[1, 3.4, -38]} color="#ffd9a0" scale={16} opacity={0.5} />

      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, -18]}>
        <planeGeometry args={[220, 120]} />
        <meshStandardMaterial color="#161f3a" roughness={0.22} metalness={0.75} />
      </mesh>

      {/* sun reflection strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, -0.88, -14]}>
        <planeGeometry args={[9, 26]} />
        <meshStandardMaterial color="#ffb46b" emissive="#ffab66" emissiveIntensity={0.9} transparent opacity={0.55} />
      </mesh>

      {/* water sparkles */}
      <points ref={sparkle} geometry={sparkleData}>
        <pointsMaterial map={sparkleTex} size={0.35} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation color="#fff2c2" />
      </points>

      {/* fireworks */}
      <points ref={fw}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fireData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial map={sparkleTex} size={0.5} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation color="#ff9ec2" />
      </points>
    </group>
  )
}