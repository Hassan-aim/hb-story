import { useEffect, useMemo, useRef, useState } from 'react'

export interface TypewriterState {
  lineIndex: number
  charCount: number
  finished: boolean
}

/* Types lines one after another; after each line's pause, moves on. */
export function useTypewriter(
  lines: readonly string[],
  opts: { cps?: number; linePause?: number; startDelay?: number } = {},
): TypewriterState {
  const { cps = 22, linePause = 520, startDelay = 900 } = opts
  const [state, setState] = useState<TypewriterState>({ lineIndex: 0, charCount: 0, finished: false })
  const stateRef = useRef(state)
  stateRef.current = state

  const total = useMemo(() => lines.join('').length, [lines])

  useEffect(() => {
    let timeout = 0
    const tick = () => {
      const s = stateRef.current
      const line = lines[s.lineIndex] ?? ''
      const lineDone = s.charCount >= line.length
      if (s.finished) return
      if (lineDone) {
        if (s.lineIndex >= lines.length - 1) {
          setState({ ...s, finished: true })
          return
        }
        timeout = window.setTimeout(() => {
          const ns = { lineIndex: s.lineIndex + 1, charCount: 0, finished: false }
          stateRef.current = ns
          setState(ns)
        }, linePause)
      } else {
        const step = Math.max(1, Math.round((line.length / Math.max(1, total)) * 4))
        const chars = Math.random() < 0.92 ? cps : cps * 2.4
        timeout = window.setTimeout(() => {
          const ns = { ...s, charCount: Math.min(line.length, s.charCount + Math.min(step, 2)) }
          stateRef.current = ns
          setState(ns)
        }, 1000 / chars)
      }
    }
    timeout = window.setTimeout(tick, startDelay)
    return () => clearTimeout(timeout)
  }, [lines, cps, total, startDelay])

  return state
}