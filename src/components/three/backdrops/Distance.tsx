import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky } from './common'

/* Long distance — two cities, two screens, one glowing heart-line. */
export function DistanceBackdrop() {
  const group = useRef<THREE.Group>(null)

  const skyline = useMemo(() => {
    const arr: Array<{ side: -1 | 1; x: number; h: number; w: number; lit: boolean }> = []
    for (let i = 0; i < 70; i++) {
      const side: -1 | 1 = i % 2 === 0 ? -1 : 1
      arr.push({
        side,
        x: side * (2.5 + Math.random() * 11),
        h: 3 + Math.random() * 8,
        w: 1.4 + Math.random() * 2.2,
        lit: Math.random() > 0.55,
      })
    }
    return arr
  }, [])

  // laptops on each side
  const laptopTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#0b0f22'
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#ff5d87'
    ctx.font = 'bold 52px sans-serif'
    ctx.fillText('video call…', 24, 120)
    ctx.fillStyle = 'rgba(255,122,162,0.5)'
    ctx.font = '40px sans-serif'
    ctx.fillText('2:47 AM', 24, 190)
    ctx.fillStyle = '#ffd9a0'
    ctx.font = '34px sans-serif'
    ctx.fillText('❤', 200, 190)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  }, [])

  // glowing heart line between the two screens
  const linePoints = useMemo(() => {
    return [
      new THREE.Vector3(-3.6, 0.2, -2.4),
      new THREE.Vector3(-1.2, 1.5, -4.6),
      new THREE.Vector3(0, 2.1, -6.5),
      new THREE.Vector3(1.2, 1.5, -4.6),
      new THREE.Vector3(3.6, 0.2, -2.4),
    ]
  }, [])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(linePoints)
    return g
  }, [linePoints])

  const ribbonLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: '#ff5d87',
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return new THREE.Line(lineGeo, mat)
  }, [lineGeo])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.12) * 0.05
      group.current.position.y = Math.sin(t * 0.4) * 0.06
    }
    const mat = ribbonLine.material as THREE.LineBasicMaterial
    mat.opacity = 0.55 + Math.sin(t * 2.2) * 0.28
  })

  return (
    <group>
      <Sky top="#03030c" mid="#10143a" horizon="#241a44" sun={[0, 20, -30]} sunColor="#5c7aff" sunStrength={0.05} />
      <ambientLight intensity={0.35} color="#7a8fff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[60, 40]} />
        <meshStandardMaterial color="#0a0c18" roughness={0.9} />
      </mesh>

      {/* two city skylines */}
      {skyline.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2 - 2, b.side === -1 ? -16 : -16]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, 1]} />
            <meshStandardMaterial color="#070a18" roughness={1} />
          </mesh>
          {b.lit && (
            <mesh position={[0, b.h / 2 - 0.8, 0.55]}>
              <planeGeometry args={[b.w * 0.5, b.h * 0.35]} />
              <meshBasicMaterial color="#ffca8a" transparent opacity={0.28} />
            </mesh>
          )}
        </group>
      ))}

      <group ref={group} position={[0, 0, 0]}>
        {/* left laptop (Hassan) */}
        <group position={[-3.7, -1.55, -2.5]} rotation={[0, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[2, 1.5, 0.12]} />
            <meshStandardMaterial color="#171b2c" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.061]}>
            <planeGeometry args={[1.8, 1.3]} />
            <meshStandardMaterial map={laptopTex} emissive="#3a2a6a" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.85, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.8]} />
            <meshStandardMaterial color="#0c0f1c" />
          </mesh>
          <mesh position={[0, 0, 1.3]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#ff5d87" emissive="#ff5d87" emissiveIntensity={1.4} />
          </mesh>
        </group>

        {/* right laptop (Bhagi) */}
        <group position={[3.7, -1.55, -2.5]} rotation={[0, -0.5, 0]}>
          <mesh>
            <boxGeometry args={[2, 1.5, 0.12]} />
            <meshStandardMaterial color="#171b2c" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.061]}>
            <planeGeometry args={[1.8, 1.3]} />
            <meshStandardMaterial map={laptopTex} emissive="#2a3a7a" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.85, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.8]} />
            <meshStandardMaterial color="#0c0f1c" />
          </mesh>
          <mesh position={[0, 0, 1.3]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#7aa2ff" emissive="#7aa2ff" emissiveIntensity={1.4} />
          </mesh>
        </group>

        {/* glowing heart ribbon */}
        <primitive object={ribbonLine} />

        {/* heart at the middle of the bridge */}
        <mesh position={[0, 2.1, -6.5]}>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshBasicMaterial color="#ff7aa2" toneMapped={false} />
        </mesh>
      </group>

      <StarsDim />
    </group>
  )
}

function StarsDim() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 400
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 90
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50 + 10
      arr[i * 3 + 2] = -20 - Math.random() * 30
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002
    }
  })

  return (
    <points ref={ref} geometry={positions}>
      <pointsMaterial size={0.09} color="#cdd6ff" transparent opacity={0.7} depthWrite={false} sizeAttenuation />
    </points>
  )
}