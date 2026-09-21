import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperience } from '../../state/experience'
import { storyChapters, introNarration, hbInstruction, storyTitle, NAMES } from '../../data/story'
import { useTypewriter } from '../../hooks/useTypewriter'
import { bus } from '../../utils/bus'

/* ---------------------------------- Title ---------------------------------- */

function TitleHandwriting() {
  const { dispatch, isTouch, isReducedMotion } = useExperience()
  const name = 'Hassan'
  const name2 = 'Bhagi'

  const letters = (w: string) => w.split('')

  useEffect(() => {
    if (isReducedMotion) {
      const t = setTimeout(() => dispatch({ type: 'TITLE_DONE' }), 1400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => dispatch({ type: 'TITLE_DONE' }), 7600)
    const skip = () => dispatch({ type: 'TITLE_DONE' })
    window.addEventListener('click', skip)
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(t)
      window.removeEventListener('click', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [dispatch, isReducedMotion])

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.h1
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-hand text-[clamp(2.8rem,9vw,6.5rem)] text-[#ff8fb0] text-glow"
        style={{ lineHeight: 1.1 }}
      >
        <span className="flex">
          {letters(name).map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, x: -10, filter: 'blur(10px)', scale: 1.15 }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ delay: 0.8 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </span>

        <motion.span
          className="anim-breathe inline-block text-[#ff4d79]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8, ease: 'backOut' }}
        >
          ❤
        </motion.span>

        <span className="flex">
          {letters(name2).map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, x: 10, filter: 'blur(10px)', scale: 1.15 }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ delay: 2.3 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      <motion.p
        className="mt-5 font-script text-[clamp(1.1rem,3vw,1.6rem)] tracking-widest text-[#ffd9a0] text-glow-gold"
        initial={{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(6px)' }}
        animate={{ opacity: 1, letterSpacing: '0.2em', filter: 'blur(0px)' }}
        transition={{ delay: 4.2, duration: 1.8, ease: 'easeOut' }}
      >
        our love story
      </motion.p>

      {isTouch && (
        <motion.p
          className="mt-10 text-xs tracking-[0.3em] text-white/50 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5, duration: 1 }}
        >
          tap to continue
        </motion.p>
      )}
    </motion.div>
  )
}

/* ---------------------------------- Intro ---------------------------------- */

function IntroOverlay() {
  const { dispatch } = useExperience()

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-[16vh] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6 }}
    >
      <motion.blockquote
        className="max-w-2xl text-center font-serif text-[clamp(1.05rem,2.6vw,1.55rem)] italic leading-relaxed text-white/90"
        initial={{ opacity: 0, filter: 'blur(14px)', y: 14, letterSpacing: '0.06em' }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0, letterSpacing: '0.02em' }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
      >
        “{introNarration}”
      </motion.blockquote>

      <motion.button
        data-cursor
        onClick={() => dispatch({ type: 'TRANSFORM' })}
        className="pointer-events-auto glass mt-10 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-light tracking-[0.25em] uppercase text-white/85 hover:shadow-[0_0_40px_rgba(255,51,102,0.45)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 1.1 }}
      >
        <motion.span
          className="inline-block text-base text-[#ff4d79]"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ❤
        </motion.span>
        Touch the heart
      </motion.button>
    </motion.div>
  )
}

/* ------------------------------ HB transform ------------------------------ */

function HBTransformOverlay() {
  const { dispatch, isReducedMotion } = useExperience()
  const [showHb, setShowHb] = useState(false)

  useEffect(() => {
    if (isReducedMotion) {
      setShowHb(true)
      dispatch({ type: 'HB_READY' })
      return
    }
    const t1 = setTimeout(() => setShowHb(true), 2100)
    const t2 = setTimeout(() => dispatch({ type: 'HB_READY' }), 3800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [dispatch, isReducedMotion])

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {!showHb ? (
        <>
          <motion.div
            className="absolute left-1/2 -translate-x-[88%] font-cinzel text-[clamp(1.6rem,5vw,3.2rem)] tracking-[0.4em] text-white/80"
            initial={{ x: '-60vw', opacity: 0, filter: 'blur(8px)' }}
            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.7, ease: 'easeInOut' }}
          >
            HASSAN
          </motion.div>
          <motion.div
            className="absolute left-1/2 -translate-x-[-190%] font-cinzel text-[clamp(1.6rem,5vw,3.2rem)] tracking-[0.4em] text-white/80"
            initial={{ x: '60vw', opacity: 0, filter: 'blur(8px)' }}
            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.7, ease: 'easeInOut' }}
          >
            {NAMES.hers.toUpperCase()}
          </motion.div>
        </>
      ) : (
        <motion.h1
          className="text-glow font-cinzel text-[clamp(3rem,11vw,7rem)] font-semibold tracking-[0.12em] text-[#ff5d87]"
          initial={{ opacity: 0, scale: 1.6, filter: 'blur(22px)', letterSpacing: '0.7em' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '0.12em' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          HB
        </motion.h1>
      )}
    </motion.div>
  )
}

/* --------------------------------- H B 3D ---------------------------------- */

function HBOverlay() {
  const { dispatch } = useExperience()
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-glow-gold font-cinzel text-[clamp(2.6rem,9vw,5.4rem)] font-semibold tracking-[0.2em] text-[#ffd9a0]"
        initial={{ opacity: 0, scale: 0.7, filter: 'blur(16px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textShadow: '0 0 30px rgba(255,122,162,0.6)' }}
      >
        HB
      </motion.h2>

      <motion.button
        data-cursor
        onClick={() => dispatch({ type: 'EXPLODE' })}
        className="pointer-events-auto glass-strong mt-10 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-light tracking-[0.25em] uppercase text-white/90"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        whileHover={{ scale: 1.06 }}
      >
        <motion.span
          className="inline-block text-lg"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          ❤
        </motion.span>
        {hbInstruction}
      </motion.button>
    </motion.div>
  )
}

/* ------------------------------ Story chapters ----------------------------- */

function ChapterOverlay() {
  const { state, dispatch, isReducedMotion } = useExperience()
  const { chapter } = state
  const item = storyChapters.find((c) => c.id === chapter) ?? storyChapters[0]
  const isLast = chapter >= storyChapters.length
  const isDistance = chapter === 8

  const tw = useTypewriter(item.lines, { cps: 24, linePause: 660, startDelay: 1100 })
  const [canAdvance, setCanAdvance] = useState(false)

  useEffect(() => {
    setCanAdvance(false)
  }, [chapter])

  useEffect(() => {
    if (!tw.finished) return
    const t = setTimeout(() => setCanAdvance(true), isDistance ? 2600 : 1700)
    return () => clearTimeout(t)
  }, [tw.finished, isDistance])

  const lines = item.lines

  useEffect(() => {
    if (!isDistance) return
    bus.emit('distance', { visible: true })
    return () => bus.emit('distance', { visible: false })
  }, [isDistance])

  return (
    <motion.div
      key={chapter}
      className="absolute inset-0 z-20 flex flex-col justify-between px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.9 }}
    >
      {/* chapter header */}
      <motion.header
        className="pt-[12vh] text-center"
        initial={{ opacity: 0, y: -18, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <motion.p
          className="mb-3 text-[0.7rem] font-light tracking-[0.5em] uppercase text-[#ff7aa2]"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ duration: 1.4 }}
        >
          {item.kicker}
        </motion.p>
        <motion.h2
          className="font-cinzel text-[clamp(1.7rem,5.5vw,3.4rem)] font-medium tracking-wide text-white text-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {item.title}
        </motion.h2>
      </motion.header>

      {/* narration */}
      <motion.div
        className="glass-strong mx-auto mb-[10vh] w-full max-w-2xl rounded-3xl px-6 py-5"
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <div className="no-scrollbar max-h-[34vh] min-h-[8.5rem] overflow-y-auto font-serif text-[clamp(1rem,2.4vw,1.3rem)] leading-relaxed text-white/85">
          {lines.map((line, i) => {
            const isActive = i === tw.lineIndex
            const isTyping = isActive && !tw.finished && !isReducedMotion
            const shown = isReducedMotion
              ? line.length
              : i < tw.lineIndex || isActive
                ? i < tw.lineIndex
                  ? line.length
                  : tw.charCount
                : 0
            if (i > tw.lineIndex && !isReducedMotion) return null
            return (
              <p key={i} className={i === tw.lineIndex ? 'min-h-[1.6em]' : 'mb-2'}>
                {line.slice(0, shown)}
                {isTyping && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#ff7aa2]" style={{ animation: 'hb-caret 0.9s steps(1) infinite' }} />}
              </p>
            )
          })}
        </div>
        {canAdvance && (
          <motion.div
            className="mt-4 flex items-center justify-end gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <button
              data-cursor
              onClick={() => dispatch(isLast ? { type: 'TO_ENDING' } : { type: 'NEXT_CHAPTER' })}
              className="glass rounded-full px-6 py-2 text-xs font-light tracking-[0.3em] uppercase text-white/90 hover:shadow-[0_0_30px_rgba(255,51,102,0.4)]"
            >
              {isLast ? 'Continue — Epilogue' : `Next → Chapter ${chapter + 1}`}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------ Story title ------------------------------ */

function PortalTitle() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="font-cinzel text-[clamp(2.2rem,8vw,5rem)] font-medium tracking-[0.18em] text-white text-glow"
        initial={{ opacity: 0, scale: 1.3, filter: 'blur(20px)', letterSpacing: '0.6em' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '0.18em' }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {storyTitle}
      </motion.h1>
      <motion.p
        className="mt-5 font-script text-2xl text-[#ff7aa2]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        chapter by chapter
      </motion.p>
    </motion.div>
  )
}

/* -------------------------------- Distance UI ------------------------------ */

export function DistancePanels() {
  const { state } = useExperience()
  const visible = state.phase === 'story' && state.chapter === 8
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {[
            { label: 'Hassan', sub: 'following his dream', grad: 'from-[#ff3366]/20 to-transparent' },
            { label: 'Bhagi', sub: 'building hers', grad: 'from-[#7aa2ff]/20 to-transparent' },
          ].map((side, i) => (
            <div key={i} className={`relative h-full flex-1 ${i === 0 ? '' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-b ${side.grad}`} />
              <div className={`absolute top-[26%] ${i === 0 ? 'left-6' : 'right-6'} max-w-[38vw] text-center`}>
                <p className="font-cinzel text-lg tracking-[0.3em] text-white/70">{side.label}</p>
                <p className="mt-1 font-serif text-xs italic text-white/45">{side.sub}</p>
              </div>
              {i === 0 && (
                <div className="absolute left-[calc(50%-1px)] top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#ff5d87]/40 to-transparent" />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------- Ending UI ------------------------------- */

function EndingOverlay() {
  const { dispatch } = useExperience()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    setStage(0)
    const t1 = setTimeout(() => setStage(1), 3200)
    const t2 = setTimeout(() => setStage(2), 6200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4 }}
    >
      <motion.div
        className="mb-8 text-glow font-cinzel text-[clamp(1.8rem,5vw,3rem)] tracking-[0.3em] text-[#ff5d87]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: stage >= 0 ? 1 : 0, scale: 1 }}
        transition={{ duration: 1.6 }}
      >
        HB
      </motion.div>

      <AnimatePresence>
        {stage >= 1 && (
          <motion.h2
            key="tbc"
            className="text-glow font-cinzel text-[clamp(2rem,7vw,4.2rem)] font-medium tracking-[0.14em] text-white"
            initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            To Be Continued...
          </motion.h2>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage >= 2 && (
          <div className="pointer-events-auto mt-10 flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: 'backOut' }}
            >
              <motion.p
                className="font-script text-[clamp(1.6rem,4.5vw,2.4rem)] text-[#ffd9a0] text-glow-gold"
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                Forever Starts Here ❤️
              </motion.p>
            </motion.div>
            <motion.button
              data-cursor
              onClick={() => dispatch({ type: 'REPLAY' })}
              className="glass rounded-full px-8 py-3 text-sm font-light tracking-[0.25em] uppercase text-white/90 hover:shadow-[0_0_40px_rgba(255,51,102,0.45)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              ↺ Replay Our Story
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* -------------------------------- Overlay root ----------------------------- */

export function Overlays() {
  const { state } = useExperience()
  const phase = state.phase

  return (
    <>
      {phase === 'title' && <TitleHandwriting />}
      {phase === 'intro' && <IntroOverlay />}
      {phase === 'hbTransform' && <HBTransformOverlay />}
      {phase === 'hb' && <HBOverlay />}
      {phase === 'portal' && <PortalTitle />}
      {phase === 'story' && <ChapterOverlay />}
      {phase === 'ending' && <EndingOverlay />}
    </>
  )
}

export function useStoryProgress(): number {
  const { state } = useExperience()
  return useMemo(() => (state.phase === 'story' ? state.chapter : 0), [state.phase, state.chapter])
}