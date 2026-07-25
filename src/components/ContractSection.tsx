import { useEffect, useRef, useState } from 'react'
import { SITE } from '../config/site'
import { IconCheck, IconCopy } from './SocialIcons'

function useTypeLine(full: string, active: boolean, speed = 28) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) {
      setText('')
      setDone(false)
      return
    }
    let i = 0
    setText('')
    setDone(false)
    const id = window.setInterval(() => {
      i += 1
      setText(full.slice(0, i))
      if (i >= full.length) {
        window.clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => window.clearInterval(id)
  }, [full, active, speed])

  return { text, done }
}

export function ContractSection() {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const ref = useRef<HTMLElement>(null)

  const ca = SITE.contractAddress
  const canCopy = Boolean(SITE.contractLive && ca && !ca.toLowerCase().includes('coming soon'))
  const footerMsg = canCopy
    ? 'Always verify the contract address before interacting.'
    : 'Contract address will be published here after launch.'

  // Start animation when section enters viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cmd = useTypeLine('>_ cat contract.txt', visible, 32)
  const title = useTypeLine('CA: Contract Address', step >= 1, 36)
  const chain = useTypeLine(`Chain: ${SITE.chain}`, step >= 2, 30)
  const addr = useTypeLine(ca, step >= 3, 22)
  const note = useTypeLine(footerMsg, step >= 4, 18)

  useEffect(() => {
    if (cmd.done && step < 1) setStep(1)
  }, [cmd.done, step])
  useEffect(() => {
    if (title.done && step < 2) setStep(2)
  }, [title.done, step])
  useEffect(() => {
    if (chain.done && step < 3) setStep(3)
  }, [chain.done, step])
  useEffect(() => {
    if (addr.done && step < 4) setStep(4)
  }, [addr.done, step])

  async function copyCa() {
    if (!canCopy) return
    try {
      await navigator.clipboard.writeText(ca)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <section id="contract" ref={ref} className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-xl border border-border bg-card overflow-hidden terminal-glow">
          {/* LTR ambient sweep over whole card */}
          <div className="contract-card-shine pointer-events-none absolute inset-0 z-0" aria-hidden />

          {/* Terminal title bar */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">
              user@gitart - ~/contract
            </span>
          </div>

          <div className="relative z-10 p-5 md:p-8 font-mono scanline">
            {/* > cat contract.txt */}
            <p className="text-sm text-primary terminal-text mb-4 min-h-[1.25rem]">
              {cmd.text}
              {visible && !cmd.done && <span className="animate-blink">|</span>}
            </p>

            {/* Title */}
            <div className="mb-3 min-h-[2rem]">
              {step >= 1 && (
                <h2 className="text-xl md:text-2xl font-bold">
                  <span className="text-foreground">
                    {title.text.startsWith('CA:') ? (
                      <>
                        CA:
                        <span className="text-primary terminal-text">
                          {title.text.slice(3)}
                        </span>
                      </>
                    ) : (
                      <span className="text-primary terminal-text">{title.text}</span>
                    )}
                    {!title.done && <span className="animate-blink">|</span>}
                  </span>
                </h2>
              )}
            </div>

            {/* Chain badge */}
            <div className="mb-5 min-h-[1.75rem]">
              {step >= 2 && (
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary border border-border px-2.5 py-1 rounded overflow-hidden relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {chain.text}
                  {!chain.done && <span className="animate-blink">|</span>}
                  <span className="terminal-badge-shine absolute inset-0 pointer-events-none" />
                </span>
              )}
            </div>

            {/* Address row */}
            {step >= 3 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in">
                <code className="contract-addr relative flex-1 break-all rounded-lg border border-primary/30 bg-background px-4 py-3 text-sm font-mono text-primary terminal-text overflow-hidden">
                  <span className="relative z-10">
                    {addr.text}
                    {!addr.done && <span className="animate-blink">|</span>}
                  </span>
                  <span className="terminal-badge-shine absolute inset-0 pointer-events-none" />
                </code>
                <button
                  type="button"
                  onClick={copyCa}
                  disabled={!canCopy || !addr.done}
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 relative overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {copied ? (
                      <>
                        <IconCheck className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-4 h-4" />
                        Copy CA
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* Footer note */}
            <p className="mt-5 text-xs text-muted-foreground min-h-[1rem]">
              {step >= 4 && (
                <>
                  <span className="text-primary/70">&gt; </span>
                  {note.text}
                  {!note.done && <span className="animate-blink">|</span>}
                </>
              )}
            </p>

            {/* Idle prompt when all done */}
            {note.done && (
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-primary font-semibold">{'>_'}</span>
                <span className="animate-blink">|</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
