/*
 * AudioManager — procedural WebAudio soundtrack + ambience + SFX.
 * No external audio files: everything is synthesized so the experience
 * always works, offline or online.
 */

export type AmbienceKind = 'none' | 'wind' | 'rain' | 'night' | 'birds' | 'warm'

type Note = number

const A4 = 440

function midi(m: number): Note {
  return A4 * Math.pow(2, (m - 69) / 12)
}

// gentle progressions (degrees relative to a root, minor-feel / major-feel)
const PROGRESSIONS: Record<string, { chords: number[][]; base: number }> = {
  wonder: {
    base: 60, // C4
    chords: [
      [0, 3, 7, 10], // Cmaj7
      [-4, 0, 3, 7], // Am7
      [-7, -3, 0, 4], // Fmaj7 -> use [5,8,12]? keep simple
      [-2, 2, 5, 10], // G7sus -> D? we'll approximate musically loosely
    ],
  },
  night: {
    base: 57, // A3
    chords: [
      [0, 3, 7, 10],
      [-3, 0, 3, 9],
      [-5, -2, 2, 7],
      [5, 9, 12, 16],
    ],
  },
  love: {
    base: 65, // F4
    chords: [
      [0, 4, 7, 11],
      [-2, 2, 5, 9],
      [-4, 0, 3, 7],
      [-5, -1, 2, 6],
    ],
  },
  hope: {
    base: 62,
    chords: [
      [0, 4, 7, 11],
      [2, 5, 9, 12],
      [0, 4, 7, 9],
      [7, 11, 14, 17],
    ],
  },
}

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicGain: GainNode | null = null
  private fxGain: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private musicFilter: BiquadFilterNode | null = null
  private ambFilter: BiquadFilterNode | null = null
  muted = false
  private running = false
  private ambience: AmbienceKind = 'none'
  private ambienceNodes: AudioNode[] = []
  private voiceNodes: AudioNode[] = []
  private progIndex = 0
  private nextNoteTime = 0
  private timerId: number | null = null
  private theme: keyof typeof PROGRESSIONS = 'wonder'
  private reverb: ConvolverNode | null = null
  private listeners: Array<(name: string) => void> = []

  onEvent(cb: (name: string) => void): () => void {
    this.listeners.push(cb)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb)
    }
  }

  private emit(name: string) {
    this.listeners.forEach((l) => l(name))
  }

  unlock(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return true
    }
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.master.connect(this.ctx.destination)

      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0
      this.reverb = this.makeReverb()
      if (this.reverb) {
        this.musicGain.connect(this.reverb)
      }
      this.musicGain.connect(this.master)

      this.fxGain = this.ctx.createGain()
      this.fxGain.gain.value = 0.9
      this.fxGain.connect(this.master)

      this.ambienceBus = this.ctx.createGain()
      this.ambienceBus.gain.value = 0
      this.ambienceBus.connect(this.master)

      this.ambFilter = this.ctx.createBiquadFilter()
      this.ambFilter.type = 'lowpass'
      this.ambFilter.frequency.value = 1400
      this.ambienceBus.connect(this.ambFilter)
      this.ambFilter.connect(this.master)

      this.musicFilter = this.ctx.createBiquadFilter()
      this.musicFilter.type = 'lowpass'
      this.musicFilter.frequency.value = 6500
      this.musicFilter.Q.value = 0.3
      this.musicGain.connect(this.musicFilter)
      this.musicFilter.connect(this.master)

      this.running = true
      return true
    } catch {
      this.ctx = null
      return false
    }
  }

  private makeReverb(): ConvolverNode | null {
    if (!this.ctx) return null
    const len = this.ctx.sampleRate * 3.2
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
      }
    }
    const c = this.ctx.createConvolver()
    c.buffer = buf
    return c
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(m ? 0 : 1, this.ctx.currentTime + 0.25)
    }
  }

  setTheme(t: keyof typeof PROGRESSIONS) {
    this.theme = t
  }

  startMusic() {
    if (!this.ctx || !this.running || this.timerId !== null) return
    this.nextNoteTime = this.ctx.currentTime + 0.1
    this.progIndex = Math.floor(Math.random() * PROGRESSIONS[this.theme].chords.length)
    this.timerId = window.setInterval(() => this.schedule(), 120)
  }

  stopMusic() {
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  private schedule() {
    if (!this.ctx || !this.musicGain) return
    const prog = PROGRESSIONS[this.theme]
    const secsPerBeat = 0.42
    const lookahead = 0.25
    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      const chord = prog.chords[this.progIndex % prog.chords.length]
      const root = prog.base
      this.playChord(root, chord, this.nextNoteTime, secsPerBeat)
      this.progIndex++
      // advance: 2 bars of beats
      this.nextNoteTime += secsPerBeat * 4
    }
  }

  private playChord(root: number, chord: number[], at: number, beat: number) {
    if (!this.ctx || !this.musicGain) return
    // pad
    for (const deg of chord) {
      const f = midi(root + deg)
      this.padTone(f, at, beat * 8, 0.016)
      this.padTone(f * 2, at, beat * 8, 0.006)
    }
    // gentle bass root
    this.bassTone(midi(root - 12), at, beat * 6, 0.06)
    // arpeggio notes
    const steps = chord.slice()
    const order = steps.concat(steps.slice().reverse())
    order.forEach((deg, i) => {
      const t = at + i * beat * 0.5
      this.pluck(midi(root + deg + 12), t, 0.045)
    })
  }

  private env(g: GainNode, at: number, a: number, peak: number, d: number) {
    if (!this.ctx) return
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(peak, at + a)
    g.gain.exponentialRampToValueAtTime(0.0001, at + d)
  }

  private padTone(f: number, at: number, dur: number, vol: number) {
    if (!this.ctx || !this.musicGain) return
    const o1 = this.ctx.createOscillator()
    const o2 = this.ctx.createOscillator()
    o1.type = 'sine'
    o2.type = 'sine'
    o1.frequency.value = f
    o2.frequency.value = f * 1.004
    const g = this.ctx.createGain()
    this.env(g, at, dur * 0.3, vol, dur)
    o1.connect(g)
    o2.connect(g)
    g.connect(this.musicGain)
    o1.start(at)
    o2.start(at)
    o1.stop(at + dur + 0.2)
    o2.stop(at + dur + 0.2)
    this.voiceNodes = this.voiceNodes.concat([o1, o2, g])
    this.pruneVoices()
  }

  private bassTone(f: number, at: number, dur: number, vol: number) {
    if (!this.ctx || !this.musicGain) return
    const o = this.ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = f
    const g = this.ctx.createGain()
    this.env(g, at, 0.6, vol, dur)
    o.connect(g)
    g.connect(this.musicGain)
    o.start(at)
    o.stop(at + dur + 0.2)
    this.pruneVoices()
  }

  private pluck(f: number, at: number, vol: number) {
    if (!this.ctx || !this.musicGain) return
    const t = Math.max(at, this.ctx.currentTime + 0.02)
    const o = this.ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = f
    const g = this.ctx.createGain()
    this.env(g, t, 0.008, vol, 0.7)
    // gentle lowpass on the voice
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3200
    o.connect(lp)
    lp.connect(g)
    g.connect(this.musicGain)
    o.start(t)
    o.stop(t + 1)
  }

  private pruneVoices() {
    if (this.voiceNodes.length > 400) {
      this.voiceNodes.splice(0, 50).forEach((n) => {
        try {
          ;(n as OscillatorNode).stop?.()
        } catch {
          /* noop */
        }
      })
    }
  }

  fadeInMusic(dur = 3) {
    if (!this.ctx || !this.musicGain) return
    const t = this.ctx.currentTime
    this.musicGain.gain.cancelScheduledValues(t)
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t)
    this.musicGain.gain.linearRampToValueAtTime(0.32, t + dur)
  }

  fadeOutMusic(dur = 2) {
    if (!this.ctx || !this.musicGain) return
    const t = this.ctx.currentTime
    this.musicGain.gain.cancelScheduledValues(t)
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t)
    this.musicGain.gain.linearRampToValueAtTime(0.0001, t + dur)
  }

  /* ----------------------------- AMBIENCE ----------------------------- */

  setAmbience(kind: AmbienceKind, crossfadeSec = 2) {
    if (this.ambience === kind) return
    this.ambience = kind
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.ambienceNodes.forEach((n) => {
      try {
        ;(n as AudioScheduledSourceNode).stop?.(t + crossfadeSec + 0.2)
      } catch {
        /* noop */
      }
    })
    this.ambienceNodes = []
    if (kind === 'none') {
      if (this.ambienceBus) {
        this.ambienceBus.gain.cancelScheduledValues(t)
        this.ambienceBus.gain.linearRampToValueAtTime(0, t + crossfadeSec)
      }
      return
    }
    this.spawnAmbience(kind)
    if (this.ambienceBus) {
      this.ambienceBus.gain.cancelScheduledValues(t)
      this.ambienceBus.gain.linearRampToValueAtTime(this.ambienceVol(kind), t + crossfadeSec)
    }
  }

  private ambienceVol(kind: AmbienceKind): number {
    switch (kind) {
      case 'rain':
        return 0.09
      case 'wind':
        return 0.055
      case 'night':
        return 0.05
      case 'birds':
        return 0.05
      case 'warm':
        return 0.045
      default:
        return 0
    }
  }

  private noiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null
    const len = this.ctx.sampleRate * 2
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  private spawnSource(): AudioBufferSourceNode | null {
    if (!this.ctx || !this.ambienceBus) return null
    const buf = this.noiseBuffer()
    if (!buf) return null
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    src.connect(this.ambienceBus)
    src.start()
    return src
  }

  private spawnAmbience(kind: AmbienceKind) {
    if (!this.ctx || !this.ambienceBus) return
    if (kind === 'rain' || kind === 'wind' || kind === 'warm' || kind === 'night') {
      const src = this.spawnSource()
      if (!src) return
      const f = this.ctx.createBiquadFilter()
      const g = this.ctx.createGain()
      g.gain.value = 0.5
      if (kind === 'rain') {
        f.type = 'bandpass'
        f.frequency.value = 2600
        f.Q.value = 0.5
      } else if (kind === 'wind') {
        f.type = 'lowpass'
        f.frequency.value = 620
        const lfo = this.ctx.createOscillator()
        const lfoG = this.ctx.createGain()
        lfo.frequency.value = 0.09
        lfoG.gain.value = 0.18
        lfo.connect(lfoG)
        lfoG.connect(g.gain)
        lfo.start()
        this.ambienceNodes.push(g, lfoG, lfo)
      } else if (kind === 'night') {
        f.type = 'lowpass'
        f.frequency.value = 900
      } else {
        f.type = 'lowpass'
        f.frequency.value = 1400
      }
      src.connect(f)
      f.connect(g)
      g.connect(this.ambienceBus)
      this.ambienceNodes.push(src, f, g)
    }
    if (kind === 'birds') {
      // sparse chirps scheduled on a loop
      let next = this.ctx.currentTime + 0.5
      const iv = window.setInterval(() => {
        if (!this.ctx) return
        if (this.ctx.currentTime + 0.1 > next) {
          this.chirp(next)
          next = this.ctx.currentTime + 1 + Math.random() * 4
        }
      }, 300)
      this.ambienceNodes.push({ stop: () => clearInterval(iv) } as unknown as AudioNode)
    }
  }

  private chirp(at: number) {
    if (!this.ctx || !this.ambienceBus) return
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(3300, at)
    o.frequency.linearRampToValueAtTime(4200, at + 0.06)
    o.frequency.linearRampToValueAtTime(3200, at + 0.14)
    const g = this.ctx.createGain()
    this.env(g, at, 0.01, 0.025, 0.18)
    o.connect(g)
    g.connect(this.ambienceBus)
    o.start(at)
    o.stop(at + 0.2)
  }

  /* ----------------------------- SFX ----------------------------- */

  private thump(t: number, f: number, vol: number, dur: number) {
    if (!this.ctx || !this.fxGain) return
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 0.5, t + dur)
    const g = this.ctx.createGain()
    this.env(g, t, 0.005, vol, dur)
    o.connect(g)
    g.connect(this.fxGain)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  heartbeat() {
    if (!this.ctx || !this.running || this.muted) return
    const t = this.ctx.currentTime
    this.thump(t, 62, 0.55, 0.16)
    this.thump(t + 0.2, 50, 0.32, 0.2)
    this.emit('heartbeat')
  }

  click() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(1400, t)
    o.frequency.exponentialRampToValueAtTime(600, t + 0.07)
    const g = this.ctx.createGain()
    this.env(g, t, 0.005, 0.12, 0.09)
    o.connect(g)
    g.connect(this.fxGain)
    o.start(t)
    o.stop(t + 0.1)
  }

  whoosh() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    this.noiseSweep(t, 200, 2800, 0.28, 0.12)
  }

  sparkle() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    for (let i = 0; i < 8; i++) {
      const at = t + i * 0.03
      const o = this.ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = 1800 + Math.random() * 2400
      const g = this.ctx.createGain()
      this.env(g, at, 0.004, 0.05, 0.22)
      o.connect(g)
      g.connect(this.fxGain)
      o.start(at)
      o.stop(at + 0.3)
    }
  }

  boom() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    this.noiseSweep(t, 120, 900, 0.7, 0.5)
    this.thump(t, 90, 0.6, 0.5)
    this.thump(t + 0.18, 60, 0.5, 0.6)
  }

  page() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    this.noiseSweep(t, 900, 160, 0.22, 0.08)
  }

  chime(at = 0) {
    if (!this.ctx || !this.fxGain || this.muted) return
    const ctx = this.ctx
    const fx = this.fxGain
    const t = ctx.currentTime + at
    ;[[880, 0.12], [1108.7, 0.12], [1318.5, 0.15]].forEach(([f, v], i) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = ctx.createGain()
      this.env(g, t + i * 0.09, 0.005, v, 1.4)
      o.connect(g)
      g.connect(fx)
      o.start(t + i * 0.09)
      o.stop(t + i * 0.09 + 1.5)
    })
  }

  pop() {
    if (!this.ctx || !this.fxGain || this.muted) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(500, t)
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.06)
    const g = this.ctx.createGain()
    this.env(g, t, 0.004, 0.09, 0.1)
    o.connect(g)
    g.connect(this.fxGain)
    o.start(t)
    o.stop(t + 0.12)
  }

  private noiseSweep(t: number, f0: number, f1: number, dur: number, vol: number) {
    if (!this.ctx || !this.fxGain) return
    const buf = this.noiseBuffer()
    if (!buf) return
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 0.8
    f.frequency.setValueAtTime(f0, t)
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, f0 + 10), t + dur)
    const g = this.ctx.createGain()
    this.env(g, t, 0.02, vol, dur)
    src.connect(f)
    f.connect(g)
    g.connect(this.fxGain)
    src.start(t)
    src.stop(t + dur + 0.1)
  }

  flushOnSceneChange() {
    // quick reverb tail ducking
    if (this.reverb && this.ctx) {
      const g = this.reverb
      // nothing heavy needed; keep implementation minimal
      void g
    }
  }
}

export const audio = new AudioManager()
export type { AudioManager }