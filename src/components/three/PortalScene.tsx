import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { softGlowTexture } from '../../three/shapes'

/* A magical circular portal — rotating rings, glowing vortex, light rays. */
export function PortalScene() {
  const group = useRef<THREE.Group>(null)
  const vortex = useRef<THREE.Points>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const ringC = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const count = 900

  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const seeds = useMemo(() => new Float32Array(count * 2), [count])
  const glowTex = useMemo(() => softGlowTexture('255,190,215', '190,120,255'), [])

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      seeds[i * 2] = Math.random() * Math.PI * 2
      seeds[i * 2 + 1] = 0.3 + Math.random() * 0.7
    }
  }, [count, positions, seeds])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.4
    if (group.current) {
      // slight wind-blown film through space
      group.current.position.z = Math.sin(clock.elapsedTime * 0.4) * 0.4
    }
    if (ringA.current) {
      ringA.current.rotation.z = t * 0.7
      ringA.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.3
    }
    if (ringB.current) {
      ringB.current.rotation.z = -t * 0.5
      ringB.current.rotation.y = Math.cos(clock.elapsedTime * 0.4) * 0.4
    }
    if (ringC.current) {
      ringC.current.rotation.z = t * 1.1
      ringC.current.rotation.x = -0.4
    }
    if (core.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.06
      core.current.scale.setScalar(s)
      ;(core.current.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(clock.elapsedTime * 2) * 0.2
    }
    if (vortex.current) {
      const p = vortex.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        const a = seeds[i * 2] + t * 1.6
        const rr = seeds[i * 2 + 1] * 3.2
        p.array[i * 3] = Math.cos(a) * rr
        p.array[i * 3 + 1] = Math.sin(a) * rr * 0.9
        p.array[i * 3 + 2] = Math.sin(a + i) * 0.5
      }
      p.needsUpdate = true
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* glowing core */}
      <mesh ref={core} position={[0, 0, 0]}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      <sprite scale={[9, 9, 1]}>
        <spriteMaterial map={glowTex} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* vortex */}
      <points ref={vortex} geometry={geo}>
        <pointsMaterial map={glowTex} size={0.12} transparent depthWrite={false} blending={THREE.AdditiveBlending} color="#ffb6d3" sizeAttenuation opacity={1} />
      </points>

      {/* rings */}
      <mesh ref={ringA} rotation={[0, 0, 0]}>
        <torusGeometry args={[2.6, 0.05, 12, 80]} />
        <meshBasicMaterial color="#ff6a98" transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[3.2, 0.04, 12, 80]} />
        <meshBasicMaterial color="#e08bff" transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ringC} rotation={[-0.3, 0.3, 0]}>
        <torusGeometry args={[1.9, 0.035, 12, 80]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} depthWrite={false} />
      </mesh>

      {/* light rays */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.4]}>
        <coneGeometry args={[4.6, 7, 3, 1, true]} />
        <meshBasicMaterial color="#ff77a8" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, 0, -0.4]}>
        <coneGeometry args={[4.6, 7, 3, 1, true]} />
        <meshBasicMaterial color="#c99bff" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}