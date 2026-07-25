const COMMANDS = [
  { cmd: 'gitart create "idea"', desc: 'Create a new website from your idea' },
  { cmd: 'gitart preview', desc: 'Preview your generated website' },
  { cmd: 'gitart edit [section] "instruction"', desc: 'Edit sections with AI assistance' },
  { cmd: 'gitart add section "name"', desc: 'Add a new section to your website' },
  { cmd: 'gitart remove [section]', desc: 'Remove a section from your website' },
  { cmd: 'gitart theme "style"', desc: 'Apply a new theme to your website' },
  { cmd: 'gitart deploy', desc: 'Deploy your website live' },
  { cmd: 'gitart connect-robinhood', desc: 'Connect your RobinHood wallet' },
  { cmd: 'gitart mint', desc: 'Mint your project as NFT on RobinHood' },
]

export function CommandsSection() {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          Core <span className="text-primary">Commands</span>
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          Everything you need to build, customize, and deploy your website.
        </p>

        <div className="max-w-3xl mx-auto space-y-3">
          {COMMANDS.map((c) => (
            <div
              key={c.cmd}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-border bg-card px-4 py-3"
            >
              <code className="text-primary font-mono text-sm md:text-base flex-shrink-0">
                <span className="font-semibold">{'>_'}</span> {c.cmd}
              </code>
              <span className="text-sm text-muted-foreground sm:ml-auto sm:text-right">
                {c.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
