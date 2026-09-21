import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperience } from '../../state/experience'
import { storyChapters } from '../../data/story'
import { GlassButton } from './GlassButton'
import { audio } from '../../audio/AudioManager'

function useIdle(autoHideMs = 3600) {
  const [active, setActive] = useState(true)
  useEffect(() => {
    const reset = () => setActive(true)
    let t = 0
    const onMove = () => {
      setActive(true)
      clearTimeout(t)
      t = window.setTimeout(() => setActive(false), autoHideMs)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onMove)
    reset()
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      clearTimeout(t)
    }
  }, [autoHideMs])
  return active
}

export function Controls() {
  const { state, dispatch } = useExperience()
  const active = useIdle()
  const [storyOpen, setStoryOpen] = useState(false)
  const [muted, setMuted] = useState(state.muted)
  const phase = state.phase
  const inStory = phase === 'story'
  const showNav = inStory || phase === 'ending'
  const visible = active || storyOpen

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    dispatch({ type: 'TOGGLE_MUTE' })
    audio.setMuted(next)
  }

  const goFullscreen = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.()
    else void document.exitFullscreen?.()
  }

  const goHome = () => dispatch({ type: 'REPLAY' })
  const goBack = () => dispatch({ type: 'PREV_CHAPTER' })
  const goNext = () => dispatch({ type: state.chapter >= storyChapters.length ? 'TO_ENDING' : 'NEXT_CHAPTER' })

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* top-right: mute + fullscreen */}
            <div className="absolute right-4 top-4 flex gap-2">
              <GlassButton onClick={toggleMute} ariaLabel={muted ? 'Unmute' : 'Mute'}>
                {muted ? '🔇' : '🔊'}
              </GlassButton>
              <GlassButton onClick={goFullscreen} ariaLabel="Fullscreen">
                ⛶
              </GlassButton>
            </div>

            {/* top-left: home */}
            <div className="absolute left-4 top-4">
              <GlassButton onClick={goHome} ariaLabel="Back to the beginning">
                ⌂
              </GlassButton>
            </div>

            {/* bottom-left: story timeline */}
            <div className="absolute bottom-5 left-5">
              <GlassButton onClick={() => setStoryOpen((v) => !v)} ariaLabel="Open story timeline">
                ✦ Story
              </GlassButton>
            </div>

            {/* bottom-center: back / next */}
            {showNav && (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3">
                <GlassButton onClick={goBack} ariaLabel="Previous chapter" disabled={!inStory || state.chapter <= 1}>
                  ←
                </GlassButton>
                <motion.div
                  className="glass-strong rounded-full px-4 py-2 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="font-script text-lg leading-none text-[#ff7aa2]">
                    {inStory ? storyChapters[state.chapter - 1]?.title : 'The End'}
                  </p>
                </motion.div>
                <GlassButton onClick={goNext} ariaLabel="Next chapter" disabled={!inStory}>
                  →
                </GlassButton>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* story timeline */}
      <AnimatePresence>
        {storyOpen && inStory && (
          <motion.div
            className="glass-strong fixed bottom-20 left-1/2 z-40 w-[min(92vw,760px)] -translate-x-1/2 rounded-3xl px-6 py-5"
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-center text-[0.65rem] font-light tracking-[0.5em] uppercase text-white/50">
              Our Story — scenes
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {storyChapters.map((c) => {
                const activeId = state.chapter === c.id
                return (
                  <button
                    key={c.id}
                    data-cursor
                    onClick={() => dispatch({ type: 'GOTO_CHAPTER', chapter: c.id })}
                    className="group flex min-w-[34px] flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all hover:bg-white/5"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.6rem] transition-all ${
                        activeId
                          ? 'border-[#ff5d87] bg-[#ff3366]/25 text-[#ff9db8] shadow-[0_0_16px_rgba(255,51,102,0.5)]'
                          : 'border-white/15 text-white/50 group-hover:border-white/40'
                      }`}
                    >
                      {activeId ? '❤' : String(c.id).padStart(2, '0')}
                    </span>
                    <span className={`whitespace-nowrap text-[0.55rem] tracking-wider ${activeId ? 'text-[#ff9db8]' : 'text-white/35'}`}>
                      {c.kicker}
                    </span>
                  </button>
                )
              })}
              <button
                data-cursor
                onClick={() => dispatch({ type: 'TO_ENDING' })}
                className="group flex min-w-[34px] flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all hover:bg-white/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[0.6rem] text-white/50 group-hover:border-white/40">
                  ∞
                </span>
                <span className="text-[0.55rem] tracking-wider text-white/35">End</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}