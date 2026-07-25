import { TerminalModal } from './TerminalModal'
import { useEffect, useState } from 'react'
import { SITE } from '../config/site'
import { IconCode, IconGithub, IconX } from './SocialIcons'

export function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-primary/40 bg-primary/10 text-primary">
              <IconCode className="w-4 h-4" />
            </span>
            <span className="font-bold text-xl">
              <span className="text-white">Git</span>
              <span className="text-primary">art</span>
            </span>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded hidden sm:inline">
              on RobinHood
            </span>
          </a>

          <div className="hidden md:flex items-center gap-5">
            <a
              href="#demo"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </a>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#commands"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Commands
            </a>
            <a
              href="#contract"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              CA
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={SITE.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
            >
              <IconX className="w-3.5 h-3.5" />
            </a>
            <a
              href={SITE.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
            >
              <IconGithub className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center h-8 rounded-md px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      <TerminalModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
