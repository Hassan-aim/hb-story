import * as THREE from 'three'
import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { useExperience } from '../../state/experience'
import { Universe } from './Universe'
import { BeatRig } from './BeatRig'
import { HeartMesh } from './HeartMesh'
import { CrystalHeart } from './CrystalHeart'
import { Explosion } from './Explosion'
import { PortalScene } from './PortalScene'
import { StoryBackdrop } from './StoryBackdrop'
import { CameraRig } from './CameraRig'

function EnvMap() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new RoomEnvironment()
    const rt = pmrem.fromScene(envScene, 0.04)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.55
    return () => {
      scene.environment = null
      rt.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function PostFX() {
  const { quality } = useExperience()
  if (quality === 'low') return null
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={quality === 'high' ? 0.85 : 0.5} luminanceThreshold={0.55} luminanceSmoothing={0.22} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={0.82} />
      {quality === 'high' && <Noise opacity={0.035} />}
    </EffectComposer>
  )
}

function HeartbeatDriver() {
  const { state } = useExperience()
  const phase = state.phase
  const ch5 = phase === 'story' && state.chapter === 5
  const beating = phase === 'intro' || phase === 'hb' || phase === 'ending' || ch5
  const rate = ch5 ? 0.74 : phase === 'ending' ? 0.9 : 0.84
  return <BeatRig active={beating} rate={rate} intensity={1} shakeAmount={phase === 'hb' || ch5 ? 0.03 : 0.014} />
}

function SceneLayer() {
  const { state } = useExperience()
  const phase = state.phase

  return (
    <>
      {/* persistent cinematic atmosphere */}
      <Universe />

      <HeartbeatDriver />

      {/* intro heart */}
      {phase === 'intro' && <HeartMesh size={1.15} />}
      {phase === 'hbTransform' && <HeartMesh size={1.3} interactive={false} position={[0, 0, 2.2]} />}

      {/* crystal heart */}
      {(phase === 'hb' || phase === 'hbTransform') && <CrystalHeart />}

      {phase === 'explosion' && <Explosion />}
      {phase === 'portal' && <PortalScene />}
      {phase === 'story' && <StoryBackdrop chapter={state.chapter} />}
    </>
  )
}

export function ExperienceCanvas() {
  const { quality } = useExperience()
  const dpr = useMemo<[number, number]>(() => {
    if (quality === 'high') return [1, 1.75]
    if (quality === 'medium') return [1, 1.4]
    return [1, 1]
  }, [quality])

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={dpr}
        camera={{ fov: 55, near: 0.1, far: 400, position: [0, 0.4, 7.2] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 24, 95]} />
        <EnvMap />
        <Suspense fallback={null}>
          <SceneLayer />
        </Suspense>
        <CameraRig />
        {quality !== 'low' && <PostFX />}
      </Canvas>
    </div>
  )
}