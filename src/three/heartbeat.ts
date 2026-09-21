/* Shared heartbeat value written by the 3D rig, read by meshes. */

export const heartbeat = {
  value: 0, // 0..1 pulse envelope of the current beat
  beatPhase: 0, // 0..1 progress through the current beat cycle
  rate: 0.82, // seconds per double-thump
  intensity: 1,
  active: false,
}

export function beatEnvelope(phase: number): number {
  // double-thump: two quick decay spikes within one cycle
  const p = phase % 1
  const a = p < 0.14 ? Math.exp(-p * 24) : 0
  const p2 = p - 0.22
  const b = p2 > 0 && p2 < 0.16 ? Math.exp(-p2 * 26) : 0
  return Math.max(a * 0.85, b * 0.5)
}