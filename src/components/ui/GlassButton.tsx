import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function GlassButton({ children, className = '', ariaLabel, ...rest }: GlassButtonProps) {
  return (
    <button
      {...rest}
      data-cursor
      aria-label={ariaLabel}
      className={`glass flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-light tracking-wide text-white/90 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,51,102,0.25)] hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  )
}