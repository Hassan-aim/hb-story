import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { heartbeat, beatEnvelope } from '../../three/heartbeat'
import { audio } from '../../audio/AudioManager'
import { bus } from '../../utils/bus'
import { cameraCtrl } from '../../three/cameraController'

interface BeatRigProps {
  active: boolean
  rate?: number
  intensity?: number
  shakeAmount?: number
}

/* Drives the global heartbeat clock; used by the intro heart, crystal
   heart and ending scene so every heartbeat stays synchronized with audio. */
export function BeatRig({ active, rate = 0.82, intensity = 1, shakeAmount = 0.02 }: BeatRigProps) {
  const acc = useRef(0)

  useFrame((_, delta) => {
    if (!active) {
      heartbeat.value = 0
      heartbeat.active = false
      return
    }
    heartbeat.active = true
    heartbeat.rate = rate
    heartbeat.intensity = intensity
    acc.current += delta
    if (acc.current >= rate) {
      acc.current -= rate
      audio.heartbeat()
      bus.emit('beat')
      cameraCtrl.shakeTarget = Math.max(cameraCtrl.shakeTarget, shakeAmount * intensity)
    }
    heartbeat.beatPhase = acc.current / rate
    heartbeat.value = beatEnvelope(heartbeat.beatPhase) * intensity
  })

  return null
}