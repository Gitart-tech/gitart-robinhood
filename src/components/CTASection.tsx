import { useState } from 'react'
import { TerminalModal } from './TerminalModal'

export function CTASection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl border border-border bg-card p-8 md:p-12 terminal-glow relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Ready to build your <span className="text-primary">website?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start building websites with terminal commands today. No design skills needed. Just
              describe and deploy.
            </p>

            <div className="rounded-lg border border-border bg-background p-4 md:p-6 text-left max-w-md mx-auto mb-8 font-mono text-sm">
              <div className="text-muted-foreground mb-1">
                <span className="text-primary font-semibold">{'>_'}</span> npm install -g gitart
              </div>
              <div className="text-muted-foreground mb-3">
                <span className="text-primary font-semibold">{'>_'}</span> gitart
              </div>
              <div className="text-primary mb-1">Welcome to Gitart.</div>
              <div className="text-muted-foreground mb-3">AI Website Builder on RobinHood.</div>
              <div className="text-muted-foreground">Type:</div>
              <div className="text-[#2aa8b0]">gitart create &quot;your website idea&quot;</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center h-10 rounded-md px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </button>
              <a
                href="#commands"
                className="inline-flex items-center justify-center h-10 rounded-md px-6 text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Read Documentation
              </a>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Free to use. Deploy unlimited websites. Mint on RobinHood.
            </p>
          </div>
        </div>
      </div>

      <TerminalModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  )
}
