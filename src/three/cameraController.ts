import * as THREE from 'three'
import gsap from 'gsap'

/* A tiny cinematic camera controller shared by the Canvas-scoped rig. */

export interface CameraPose {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

export const cameraCtrl = {
  position: new THREE.Vector3(0, 0.4, 7.2),
  target: new THREE.Vector3(0, 0, 0),
  fov: 55,
  shake: 0, // decays each frame
  shakeTarget: 0,
} as {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  shake: number
  shakeTarget: number
}

export type CameraPoseInput = {
  position?: [number, number, number]
  target?: [number, number, number]
  fov?: number
}

export function flyTo(
  pose: CameraPoseInput,
  duration = 3,
  ease: string = 'power3.inOut',
  onComplete?: () => void,
) {
  gsap.killTweensOf([cameraCtrl.position, cameraCtrl.target])
  if (pose.position) {
    gsap.to(cameraCtrl.position, {
      x: pose.position[0],
      y: pose.position[1],
      z: pose.position[2],
      duration,
      ease,
      overwrite: 'auto',
    })
  }
  if (pose.target) {
    gsap.to(cameraCtrl.target, {
      x: pose.target[0],
      y: pose.target[1],
      z: pose.target[2],
      duration,
      ease,
      overwrite: 'auto',
      onComplete,
    })
  }
  if (pose.fov !== undefined) {
    gsap.to(cameraCtrl, {
      fov: pose.fov,
      duration,
      ease,
      overwrite: 'auto',
    })
  }
}

export function cameraShake(amount: number) {
  cameraCtrl.shakeTarget = Math.max(cameraCtrl.shakeTarget, amount)
}

export function waitForTweens(timeoutMs = 4000): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now()
    const check = () => {
      const busy =
        gsap.isTweening(cameraCtrl.position) ||
        gsap.isTweening(cameraCtrl.target) ||
        gsap.isTweening(cameraCtrl)
      if (busy && performance.now() - t0 < timeoutMs) {
        requestAnimationFrame(check)
      } else {
        resolve()
      }
    }
    check()
  })
}