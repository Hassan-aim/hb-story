import type { CameraPoseInput } from '../three/cameraController'

export interface ChapterCamera {
  pose: CameraPoseInput
  duration: number
  // optional slow auto-orbit afterwards
  orbit?: { speed: number; radius: number }
}

export const INTRO_CAMERA: CameraPoseInput = {
  position: [0, 0.35, 6.4],
  target: [0, -0.1, 0],
  fov: 55,
}

export const HB_CAMERA: CameraPoseInput = {
  position: [0, 0.25, 8.6],
  target: [0, 0, 0],
  fov: 60,
}

export const PORTAL_CAMERA: ChapterCamera = {
  pose: { position: [0, 0.2, 6.2], target: [0, 0, 2.4], fov: 60 },
  duration: 2.4,
}

/* fly straight through the portal into the story */
export const THROUGH_PORTAL_CAMERA: CameraPoseInput = {
  position: [0, 0.1, -7],
  target: [0, 0, 2.2],
  fov: 62,
}

export const chapterCameras: Record<number, ChapterCamera> = {
  1: {
    pose: { position: [0, 0.7, 6.2], target: [0, 0.9, -7], fov: 55 },
    duration: 3.2,
    orbit: { speed: 0.03, radius: 6.4 },
  },
  2: {
    pose: { position: [0, 0.5, 3.9], target: [0, 0.45, 0.4], fov: 55 },
    duration: 2.8,
    orbit: { speed: 0.022, radius: 3.9 },
  },
  3: {
    pose: { position: [0, 1.3, 5.6], target: [0, 1.4, -6], fov: 55 },
    duration: 3.2,
  },
  4: {
    pose: { position: [0, 0.25, 6.4], target: [0, 0.2, -2], fov: 55 },
    duration: 3,
    orbit: { speed: 0.016, radius: 6.5 },
  },
  5: {
    pose: { position: [-0.5, 0.5, 7], target: [0, 2, -26], fov: 55 },
    duration: 3.4,
  },
  6: {
    pose: { position: [0, 0.3, 5], target: [0.2, 0.4, -1.5], fov: 55 },
    duration: 2.8,
    orbit: { speed: 0.02, radius: 5 },
  },
  7: {
    pose: { position: [0, 0.4, 6.4], target: [0.6, 0, -4.4], fov: 55 },
    duration: 3.2,
  },
  8: {
    pose: { position: [0, 0.4, 8], target: [0, 0.2, -5], fov: 56 },
    duration: 3,
  },
}

export const ENDING_CAMERA: ChapterCamera = {
  pose: { position: [0.4, 0.6, 9], target: [-0.5, 0.4, -8], fov: 55 },
  duration: 4,
  orbit: { speed: -0.014, radius: 9 },
}