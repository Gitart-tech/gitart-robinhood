import { useState } from 'react'
import { TerminalBadge } from './TerminalBadge'
import { TerminalDemo } from './TerminalDemo'
import { TerminalModal } from './TerminalModal'
import { TypewriterWords } from './TypewriterWords'
import { PromptMark } from './SocialIcons'

const HERO_WORDS = ['commands', 'scripts', 'terminal', 'code', 'deploys']

export function HeroSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden scanline">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
        <TerminalBadge />

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
          Build websites like you run{' '}
          <TypewriterWords
            words={HERO_WORDS}
            className="text-primary terminal-text"
            typingSpeed={120}
            deletingSpeed={80}
            pauseDuration={2000}
          />
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Gitart is a terminal-style AI website builder on RobinHood. No preview needed. Create,
          edit, and deploy websites entirely through commands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <PromptMark className="text-primary-foreground/90" />
            gitart start
          </button>
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-6 text-sm font-medium border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            View Demo
          </a>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <code className="bg-secondary px-3 py-1 rounded inline-flex items-center gap-1.5">
            <PromptMark />
            npm install -g gitart
          </code>
        </div>
      </div>

      <div id="demo" className="relative z-10 w-full max-w-2xl mx-auto pb-16">
        <TerminalDemo />
      </div>

      <TerminalModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  )
}
