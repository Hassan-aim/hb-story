import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useExperience } from '../../state/experience'
import { EmojiCloud } from './ParticleCloud'

const EMOJIS = ['❤️', '🌹', '✨', '💖', '🩷', '💕', '💞', '💘', '💝', '🦋', '🌸', '🌺', '💫', '🦋']

/* Magical love explosion — hearts, petals, stars, butterflies, gold dust. */
export function Explosion() {
  const { quality } = useExperience()
  const time = useMemo(() => ({ current: 0 }), [])
  const flash = useRef<THREE.Mesh>(null)
  const shock = useRef<THREE.Mesh>(null)

  const tier = quality === 'high' ? 1 : quality === 'medium' ? 0.5 : 0.2
  const perEmoji = Math.round(260 * tier)

  useFrame((_, delta) => {
    time.current += delta
    if (flash.current) {
      const mat = flash.current.material as THREE.MeshBasicMaterial
      const t = time.current
      const bright = t < 0.25 ? t / 0.25 : t < 1 ? Math.max(0, 1 - (t - 0.25) / 0.75) : 0
      mat.opacity = bright * 0.85
    }
    if (shock.current) {
      const prog = Math.min(1, Math.max(0, time.current - 0.1) / 1.4)
      shock.current.scale.setScalar(0.2 + prog * 9)
      ;(shock.current.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.6
    }
  })

  return (
    <group>
      <mesh ref={flash}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshBasicMaterial color="#fff0f4" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={shock}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial color="#ff7aa2" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {EMOJIS.map((e, i) => (
        <EmojiCloud
          key={e}
          emoji={e}
          count={perEmoji}
          delay={i * 0.045}
          speed={7 + (i % 4) * 1.4}
          rise={0.8 + (i % 3) * 0.3}
          size={0.35 + (i % 5) * 0.05}
          globalTime={time}
        />
      ))}
    </group>
  )
}