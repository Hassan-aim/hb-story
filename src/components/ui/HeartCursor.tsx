import { useEffect, useRef } from 'react'
import { bus } from '../../utils/bus'

/* Replaces the OS cursor with a small glowing heart with a particle trail. */
export function HeartCursor() {
  const cursor = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })
  const active = useRef(false)

  useEffect(() => {
    document.body.classList.add('cursor-heart')

    const move = (e: MouseEvent) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      if (!active.current) {
        active.current = true
        smooth.current = { ...pos.current }
        // spawn a small heart puff
        for (let i = 0; i < 3; i++) {
          spawnSpark(e.clientX, e.clientY)
        }
      }
    }

    const spawnSpark = (x: number, y: number) => {
      if (!trailRef.current) return
      const el = document.createElement('span')
      el.className = 'heart-trail-particle'
      const a = Math.random() * Math.PI * 2
      const r = 14 + Math.random() * 22
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.setProperty('--dx', `${Math.cos(a) * r}px`)
      el.style.setProperty('--dy', `${Math.sin(a) * r}px`)
      trailRef.current.appendChild(el)
      window.setTimeout(() => el.remove(), 900)
    }

    let raf = 0
    const loop = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.4
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.4
      const c = cursor.current
      const g = glow.current
      if (c) {
        c.style.transform = `translate(${smooth.current.x}px, ${smooth.current.y}px) translate(-50%, -50%)`
      }
      const hovering = document.querySelectorAll('[data-cursor]:hover').length > 0
      if (g) {
        g.style.transform = `translate(${smooth.current.x}px, ${smooth.current.y}px) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`
        g.style.opacity = hovering ? '0.85' : '0.35'
      }
      if (Math.random() < 0.12) spawnSpark(smooth.current.x, smooth.current.y)
      raf = requestAnimationFrame(loop)
    }

    const onDown = (e: MouseEvent) => {
      for (let i = 0; i < 8; i++) spawnSpark(e.clientX, e.clientY)
    }

    const onBeat = () => {
      const c = cursor.current
      if (c) {
        c.style.scale = '1.6'
        window.setTimeout(() => {
          if (c) c.style.scale = '1'
        }, 160)
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mousedown', onDown)
    const off = bus.on('beat', onBeat)

    raf = requestAnimationFrame(loop)
    return () => {
      document.body.classList.remove('cursor-heart')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', onDown)
      off()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={trailRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />
      <div
        ref={glow}
        className="pointer-events-none fixed left-0 top-0 z-[102] transition-opacity duration-300"
        aria-hidden
        style={{ filter: 'blur(1px)' }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26">
          <path
            d="M13 22 C6 16 3 12 3 8.5 A4.5 4.5 0 0 1 13 6 A4.5 4.5 0 0 1 23 8.5 C23 12 20 16 13 22 Z"
            fill="rgba(255,102,140,0.12)"
          />
        </svg>
      </div>
      <div
        ref={cursor}
        className="pointer-events-none fixed left-0 top-0 z-[101] transition-transform duration-100"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 26 26">
          <defs>
            <filter id="cursor-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M13 22 C6 16 3 12 3 8.5 A4.5 4.5 0 0 1 13 6 A4.5 4.5 0 0 1 23 8.5 C23 12 20 16 13 22 Z"
            fill="#ff4d79"
            filter="url(#cursor-glow)"
          />
        </svg>
      </div>
    </>
  )
}