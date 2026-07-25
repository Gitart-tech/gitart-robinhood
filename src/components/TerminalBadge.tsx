import { useEffect, useState } from 'react'

const LABEL = 'CA: Contract Address'

/**
 * Hero badge: types "CA: Contract Address" once (LTR), no >_ prefix, no trailing cursor after done.
 */
export function TerminalBadge() {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    setText('')
    setDone(false)
    const id = window.setInterval(() => {
      i += 1
      setText(LABEL.slice(0, i))
      if (i >= LABEL.length) {
        window.clearInterval(id)
        setDone(true)
      }
    }, 55)
    return () => window.clearInterval(id)
  }, [])

  return (
    <a
      href="#contract"
      className="terminal-badge group relative inline-flex flex-row flex-nowrap items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs mb-8 overflow-hidden font-mono hover:bg-primary/15 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 z-10" />
      <span className="relative z-10 tracking-wide whitespace-nowrap leading-none">
        <span className="terminal-text">
          {text || '\u00A0'}
          {!done && <span className="animate-blink">|</span>}
        </span>
      </span>
      <span className="terminal-badge-shine pointer-events-none absolute inset-0" aria-hidden />
    </a>
  )
}
