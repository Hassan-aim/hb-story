import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { audio } from '../../audio/AudioManager'
import { bus } from '../../utils/bus'
import { useExperience } from '../../state/experience'

/* Cinematic loading → gated entry that unlocks audio. */
export function LoadingScreen() {
  const { dispatch, isReducedMotion } = useExperience()
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 2400
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        void Promise.all([document.fonts?.ready]).then(() => setLoaded(true))
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const enter = () => {
    if (leaving) return
    setLeaving(true)
    bus.emit('enter-story')
    audio.unlock()
    audio.setTheme('wonder')
    audio.startMusic()
    window.setTimeout(() => audio.fadeInMusic(2.5), 300)
    dispatch({ type: 'START' })
    window.setTimeout(() => dispatch({ type: 'READY' }), 1200)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 1.1, ease: 'easeInOut' }}
    >
      <motion.div
        className="mb-6 text-glow font-cinzel text-6xl tracking-[0.35rem] text-[#ff5d87]"
        initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        HB
      </motion.div>

      <div className="relative mb-10 h-10 w-10">
        {!isReducedMotion && (
          <span className="absolute inset-0 rounded-full border border-[#ff5d87]/40 anim-breathe" />
        )}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-[#ff7aa2]">
          ❤
        </span>
      </div>

      <motion.p
        className="mb-6 font-serif text-lg italic tracking-wide text-white/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        {progress > 0.6 ? 'A heartbeat away...' : 'Preparing our story...'}
      </motion.p>

      <div className="h-px w-56 overflow-hidden rounded bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#ff3366] via-[#ff7aa2] to-[#ffd9a0]"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {loaded && !leaving && (
        <motion.button
          data-cursor
          onClick={enter}
          className="glass mt-10 rounded-full px-8 py-3 text-sm font-light tracking-[0.3em] text-white/90 uppercase hover:shadow-[0_0_40px_rgba(255,51,102,0.4)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          Enter Our Story
        </motion.button>
      )}
    </motion.div>
  )
}