import { useEffect, useState } from 'react'

type SplashScreenProps = {
  onDone: () => void
  /** Auto enter after ms (default 2.8s). Click/Enter also enters. */
  durationMs?: number
}

/**
 * Simple terminal-style splash before the main landing.
 * Logo: "Git" white + "art" green - centered.
 */
export function SplashScreen({ onDone, durationMs = 2800 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fade, setFade] = useState(false)
  const [line, setLine] = useState(0)

  const bootLines = [
    '>_ gitart boot',
    '>_ loading kernel...',
    '>_ ready.',
  ]

  useEffect(() => {
    // Reveal boot lines one by one
    if (line < bootLines.length) {
      const t = setTimeout(() => setLine((n) => n + 1), 400)
      return () => clearTimeout(t)
    }
  }, [line, bootLines.length])

  useEffect(() => {
    const t = setTimeout(() => exit(), durationMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exit() {
    setFade(true)
    setTimeout(() => {
      setVisible(false)
      onDone()
    }, 400)
  }

  if (!visible) return null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={exit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') exit()
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020203] font-mono cursor-pointer select-none transition-opacity duration-400 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="Enter Gitart"
    >
      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(87, 203, 96, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87, 203, 96, 0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 text-center px-4">
        {/* Logo */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8">
          <span className="text-white">Git</span>
          <span className="text-primary terminal-text">art</span>
        </h1>

        {/* Mini terminal block */}
        <div className="mx-auto w-full max-w-sm rounded border border-border bg-card/80 text-left text-xs sm:text-sm overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-auto text-[10px] text-muted-foreground">terminal</span>
          </div>
          <div className="px-3 py-3 space-y-1 min-h-[88px]">
            {bootLines.slice(0, line).map((l) => (
              <div
                key={l}
                className={l.startsWith('>_') ? 'text-primary' : 'text-muted-foreground'}
              >
                {l}
              </div>
            ))}
            {line >= bootLines.length && (
              <div className="text-muted-foreground flex items-center gap-1">
                <span className="text-primary font-semibold">{'>_'}</span>
                <span className="animate-blink">|</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          click or press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">Enter</kbd>{' '}
          to continue
        </p>
      </div>
    </div>
  )
}
