import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ExperienceProvider, useExperience } from './state/experience'
import { ExperienceCanvas } from './components/three/ExperienceCanvas'
import { Overlays, DistancePanels } from './components/ui/Overlays'
import { Controls } from './components/ui/Controls'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { HeartCursor } from './components/ui/HeartCursor'
import { FlashOverlay } from './components/ui/FlashOverlay'
import { SequenceDirector } from './components/ui/SequenceDirector'
import { audio } from './audio/AudioManager'

function useWebGL(): boolean {
  return useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }, [])
}

function Keybinds() {
  const { state, dispatch } = useExperience()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'Enter' || k === ' ') {
        if (state.phase === 'title') dispatch({ type: 'TITLE_DONE' })
        else if (state.phase === 'intro') dispatch({ type: 'TRANSFORM' })
        else if (state.phase === 'hb') dispatch({ type: 'EXPLODE' })
      } else if (state.phase === 'story') {
        if (k === 'ArrowRight') dispatch({ type: 'NEXT_CHAPTER' })
        else if (k === 'ArrowLeft') dispatch({ type: 'PREV_CHAPTER' })
      } else if (k === 'm' || k === 'M') {
        dispatch({ type: 'TOGGLE_MUTE' })
        audio.setMuted(!state.muted)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.phase, dispatch, state.muted])
  return null
}

/* Graceful non-WebGL cinematic fallback. */
function Fallback2D() {
  const stars = useMemo(
    () => Array.from({ length: 90 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 4 })),
    [],
  )
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, #2a0f33 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, #ff336622 0%, transparent 50%)',
        }}
      />
      {stars.map((s, i) => (
        <span
          key={i}
          className="anim-twinkle absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2 + (s.d % 2),
            height: 2 + (s.d % 2),
            animationDelay: `${(i % 7) * 0.4}s`,
          }}
        />
      ))}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-sm italic text-white/40">
        WebGL unavailable — enjoying a lighter cinematic version.
      </div>
    </div>
  )
}

function Experience() {
  const { state, isTouch } = useExperience()
  const webgl = useWebGL()
  const [controlsReady, setControlsReady] = useState(false)

  useEffect(() => {
    if (state.ready) {
      const t = setTimeout(() => setControlsReady(true), 200)
      return () => clearTimeout(t)
    }
    setControlsReady(false)
  }, [state.ready])

  return (
    <>
      {webgl ? <ExperienceCanvas /> : <Fallback2D />}

      <Overlays />
      <DistancePanels />
      <SequenceDirector />
      <FlashOverlay />

      <AnimatePresence>{!state.ready && <LoadingScreen key="loading" />}</AnimatePresence>

      {state.ready && !isTouch && <HeartCursor />}
      {controlsReady && state.ready && <Controls />}
      {state.ready && <Keybinds />}

      {/* persistent film grain vignette */}
      <div className="pointer-events-none fixed inset-0 z-[60]" style={{ background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.55) 100%)' }} />
    </>
  )
}

export default function App() {
  return (
    <ExperienceProvider>
      <Experience />
    </ExperienceProvider>
  )
}