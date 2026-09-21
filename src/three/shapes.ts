import * as THREE from 'three'

/* Build a heart outline in 2D (unit-width, centered on y). */
export function heartShape(scale = 1): THREE.Shape {
  const s = new THREE.Shape()
  const pts = 160
  const ox = -0.5
  let first = true
  for (let i = 0; i <= pts; i++) {
    const t = (i / pts) * Math.PI * 2
    const x = (16 * Math.pow(Math.sin(t), 3)) / 16 - ox
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 14.5
    if (first) {
      s.moveTo(x * scale, y * scale)
      first = false
    } else {
      s.lineTo(x * scale, y * scale)
    }
  }
  return s
}

let heartGeo: THREE.ExtrudeGeometry | null = null

export function heartGeometry(): THREE.ExtrudeGeometry {
  if (heartGeo) return heartGeo
  const shape = heartShape(1)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.12,
    bevelSegments: 4,
    curveSegments: 48,
    steps: 1,
  })
  geo.center()
  heartGeo = geo
  return geo
}

export function softGlowTexture(inner = '255,160,190', outer = '255,122,162'): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, `rgba(${inner},1)`)
  g.addColorStop(0.35, `rgba(${inner},0.55)`)
  g.addColorStop(1, `rgba(${outer},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.InstancedMesh) {
      obj.geometry?.dispose?.()
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m) => {
        m?.dispose?.()
        for (const key of Object.keys(m)) {
          const v = (m as unknown as Record<string, unknown>)[key]
          if (v instanceof THREE.Texture) v.dispose()
        }
      })
    }
  })
}

export function randomInSphere(radius: number, rng: () => number = Math.random): THREE.Vector3 {
  const u = rng() * 2 - 1
  const theta = rng() * Math.PI * 2
  const phi = Math.acos(u)
  const r = radius * Math.cbrt(rng())
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  )
}