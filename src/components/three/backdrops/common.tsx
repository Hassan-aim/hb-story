import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { softGlowTexture } from '../../../three/shapes'

/* Gradient sky dome rendered with a small shader — cheap + cinematic. */
export function Sky({
  top = '#0b0610',
  mid = '#2a1024',
  horizon = '#3a1630',
  sun = [0, 14, 0] as [number, number, number],
  sunColor = '#ffb46b',
  sunStrength = 0,
}: {
  top?: string
  mid?: string
  horizon?: string
  sun?: [number, number, number]
  sunColor?: string
  sunStrength?: number
}) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uMid: { value: new THREE.Color(mid) },
      uHorizon: { value: new THREE.Color(horizon) },
      uSunPos: { value: new THREE.Vector3(sun[0], sun[1], sun[2]) },
      uSunColor: { value: new THREE.Color(sunColor) },
      uSunStrength: { value: sunStrength },
    }),
    [top, mid, horizon, sun[0], sun[1], sun[2], sunColor, sunStrength],
  )

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uSunPos;
        uniform vec3 uSunColor;
        uniform float uSunStrength;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld).y;
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.3, h));
          col = mix(col, uTop, smoothstep(0.25, 0.75, h));
          vec3 dir = normalize(uSunPos - vWorld);
          vec3 view = normalize(cameraPosition - vWorld);
          float d = max(dot(dir, view), 0.0);
          float glow = pow(d, 8.0) * 0.9 + pow(d, 40.0) * 1.6;
          col += uSunColor * glow * uSunStrength;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
    return mat
  }, [uniforms])

  return (
    <mesh material={material} frustumCulled={false}>
      <sphereGeometry args={[160, 32, 24]} />
    </mesh>
  )
}

export function Ground({ color = '#0d0710', roughness = 0.95, size = 300 }: { color?: string; roughness?: number; size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
      <circleGeometry args={[size, 48]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.05} />
    </mesh>
  )
}

/* Billboard glow sprite (sun / lamp / firelight). */
export function Glow({ position, color = '#ffd9a0', scale = 4, opacity = 0.6 }: { position?: [number, number, number]; color?: string; scale?: number; opacity?: number }) {
  const tex = useMemo(() => softGlowTexture('255,200,180', '255,150,120'), [])
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

export function canvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

/* Low-poly palm-ish / round tree */
export function Tree({ position, scale = 1, foliage = '#4a7a52', trunk = '#4a332a' }: { position: [number, number, number]; scale?: number; foliage?: string; trunk?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.3, 2.6, 6]} />
        <meshStandardMaterial color={trunk} roughness={1} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <coneGeometry args={[1.7, 3.4, 7]} />
        <meshStandardMaterial color={foliage} roughness={0.9} />
      </mesh>
      <mesh position={[0.8, 2.6, 0.4]}>
        <coneGeometry args={[1.1, 2.2, 6]} />
        <meshStandardMaterial color={foliage} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Birds({ count = 5, region = [-20, -5, -14] }: { count?: number; region?: [number, number, number] }) {
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 36,
        y: 6 + Math.random() * 8,
        z: region[2] - Math.random() * 8,
        speed: 1 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        flap: Math.random() * 6,
      })),
    [count, region],
  )
  return (
    <group>
      {data.map((b, i) => (
        <Bird key={i} seed={b} />
      ))}
    </group>
  )
}

function Bird({ seed }: { seed: { x: number; y: number; z: number; speed: number; phase: number; flap: number } }) {
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const flap = Math.sin(t * seed.flap + seed.phase) * 0.5
    if (left.current) left.current.rotation.z = 0.35 + flap
    if (right.current) right.current.rotation.z = -0.35 - flap
  })
  return (
    <group position={[seed.x, seed.y, seed.z]}>
      <mesh ref={left} position={[-0.5, 0, 0]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial color="#1a1420" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={right} position={[0.5, 0, 0]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial color="#1a1420" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}