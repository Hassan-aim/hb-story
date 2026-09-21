import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bus } from '../../utils/bus'

type FlashLevel = 'explosion' | 'soft' | 'portal'

const LEVEL_STYLE: Record<FlashLevel, { bg: string; dur: number }> = {
  explosion: { bg: 'radial-gradient(circle at 50% 50%, #fff5f8 0%, #ffd9e8 35%, #ff7aa2 70%, transparent 100%)', dur: 1500 },
  soft: { bg: 'radial-gradient(circle at 50% 50%, #ffe3ec 0%, rgba(255,160,190,0.55) 60%, transparent 100%)', dur: 900 },
  portal: { bg: '#fff9fb', dur: 2400 },
}

/* Full-screen light flashes used for explosion + portal transitions to
   cover the scene changes that happen in WebGL. */
export function FlashOverlay() {
  const [level, setLevel] = useState<FlashLevel | null>(null)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(0)

  useEffect(() => {
    const off = bus.on<FlashLevel>('flash', (l) => {
      setLevel(l)
      setLeaving(false)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setLeaving(true)
      }, LEVEL_STYLE[l].dur - 500)
    })
    return () => {
      off()
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <AnimatePresence
      onExitComplete={() => {
        setLevel(null)
        setLeaving(false)
      }}
    >
      {level && (
        <motion.div
          key={level}
          className="pointer-events-none fixed inset-0 z-[95]"
          style={{ background: LEVEL_STYLE[level].bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}