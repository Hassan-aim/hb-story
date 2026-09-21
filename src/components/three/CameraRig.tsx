import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { cameraCtrl } from '../../three/cameraController'

/* Applies the cinematic camera controller: smooth damping, FOV easing,
   heartbeat shake and a faint handheld breathing motion. */
export function CameraRig() {
  const camera = useThree((s) => s.camera)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const cam = camera as THREE.PerspectiveCamera

    // damped follow of the controller targets
    cam.position.x = THREE.MathUtils.damp(cam.position.x, cameraCtrl.position.x, 4.2, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, cameraCtrl.position.y, 4.2, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, cameraCtrl.position.z, 4.2, delta)

    if (cam.fov !== cameraCtrl.fov) {
      cam.fov = THREE.MathUtils.damp(cam.fov, cameraCtrl.fov, 4.2, delta)
      cam.updateProjectionMatrix()
    }

    // faint handheld drift
    const t = performance.now() * 0.001
    const breathe = new THREE.Vector3(
      Math.sin(t * 0.4) * 0.03,
      Math.cos(t * 0.33) * 0.02,
      0,
    )

    // decay shake
    cameraCtrl.shake = THREE.MathUtils.damp(cameraCtrl.shake, cameraCtrl.shakeTarget, 7, delta)
    cameraCtrl.shakeTarget = 0
    const sx = (Math.random() - 0.5) * 2 * cameraCtrl.shake
    const sy = (Math.random() - 0.5) * 2 * cameraCtrl.shake

    cam.position.add(breathe)
    cam.position.x += sx
    cam.position.y += sy

    cam.lookAt(cameraCtrl.target)
  })

  return null
}