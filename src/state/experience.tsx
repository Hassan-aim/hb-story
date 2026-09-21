import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'

export type Phase =
  | 'title' // handwriting title reveal
  | 'intro' // narration + interactive beating heart
  | 'hbTransform' // HASSAN + BHAGI converge -> crystal
  | 'hb' // crystal heart, click to explode
  | 'explosion' // magical burst
  | 'portal' // ride through the portal
  | 'story' // chapter engine
  | 'ending' // to be continued

export const CHAPTER_COUNT = 8 // chapters 1-7 + long distance

export interface ExperienceState {
  phase: Phase
  chapter: number // 1..CHAPTER_COUNT (active inside 'story')
  ready: boolean // loading screen finished
  started: boolean // user has entered (unlocks audio)
  muted: boolean
  enteringPortal: boolean
}

type Action =
  | { type: 'READY' }
  | { type: 'START' }
  | { type: 'TITLE_DONE' }
  | { type: 'TRANSFORM' }
  | { type: 'HB_READY' }
  | { type: 'EXPLODE' }
  | { type: 'PORTAL_ENTER' }
  | { type: 'ENTER_STORY' }
  | { type: 'NEXT_CHAPTER' }
  | { type: 'PREV_CHAPTER' }
  | { type: 'GOTO_CHAPTER'; chapter: number }
  | { type: 'TO_ENDING' }
  | { type: 'REPLAY' }
  | { type: 'TOGGLE_MUTE' }

const initialState: ExperienceState = {
  phase: 'title',
  chapter: 1,
  ready: false,
  started: false,
  muted: false,
  enteringPortal: false,
}

function reducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case 'READY':
      return { ...state, ready: true }
    case 'START':
      return { ...state, started: true }
    case 'TITLE_DONE':
      return state.phase === 'title' ? { ...state, phase: 'intro' } : state
    case 'TRANSFORM':
      return state.phase === 'intro' ? { ...state, phase: 'hbTransform' } : state
    case 'HB_READY':
      return state.phase === 'hbTransform' ? { ...state, phase: 'hb' } : state
    case 'EXPLODE':
      return state.phase === 'hb' ? { ...state, phase: 'explosion', enteringPortal: false } : state
    case 'PORTAL_ENTER':
      return state.phase === 'explosion'
        ? { ...state, phase: 'portal', enteringPortal: true }
        : state
    case 'ENTER_STORY':
      return state.phase === 'portal'
        ? { ...state, phase: 'story', chapter: 1, enteringPortal: false }
        : state
    case 'NEXT_CHAPTER': {
      if (state.phase !== 'story') return state
      const next = state.chapter + 1
      if (next > CHAPTER_COUNT) return { ...state, phase: 'ending' }
      return { ...state, chapter: next }
    }
    case 'PREV_CHAPTER': {
      if (state.phase !== 'story') return state
      return { ...state, chapter: Math.max(1, state.chapter - 1) }
    }
    case 'GOTO_CHAPTER':
      return state.phase === 'story'
        ? { ...state, chapter: Math.min(CHAPTER_COUNT, Math.max(1, action.chapter)) }
        : state
    case 'TO_ENDING':
      return state.phase === 'story' ? { ...state, phase: 'ending' } : state
    case 'REPLAY':
      return { ...state, phase: 'title', chapter: 1, enteringPortal: false }
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }
    default:
      return state
  }
}

interface ExperienceContextValue {
  state: ExperienceState
  dispatch: (action: Action) => void
  isReducedMotion: boolean
  isTouch: boolean
  quality: 'high' | 'medium' | 'low'
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null)

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be used within ExperienceProvider')
  return ctx
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const mountQuality = useCallback((): ExperienceContextValue['quality'] => {
    try {
      const ua = navigator.userAgent
      const mobile = /Android|iPhone|iPad|Mobile/i.test(ua)
      const cores = navigator.hardwareConcurrency || 4
      const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
      const webgl = (() => {
        try {
          const c = document.createElement('canvas')
          return !!(c.getContext('webgl2') || c.getContext('webgl'))
        } catch {
          return false
        }
      })()
      if (!webgl) return 'low'
      if (mobile) return cores >= 8 && mem >= 6 ? 'medium' : 'low'
      if (cores >= 8 && mem >= 6) return 'high'
      if (cores >= 4 && mem >= 4) return 'medium'
      return 'low'
    } catch {
      return 'medium'
    }
  }, [])

  const reducedMotionPref = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const isTouch = useCallback(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window
    )
  }, [])

  const value: ExperienceContextValue = {
    state,
    dispatch,
    isReducedMotion: reducedMotionPref(),
    isTouch: isTouch(),
    quality: mountQuality(),
  }

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  )
}