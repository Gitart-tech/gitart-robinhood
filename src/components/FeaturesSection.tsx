const FEATURES = [
  {
    icon: '⚡',
    title: 'AI-Powered Generation',
    description:
      'Describe your website idea and AI generates complete website structure with all sections.',
  },
  {
    icon: '🔗',
    title: 'Built on RobinHood',
    description:
      'Native RobinHood blockchain integration with wallet connect and NFT minting support.',
  },
  {
    icon: '💻',
    title: 'Terminal Interface',
    description:
      'Build websites like you run commands. No preview needed - pure terminal workflow.',
  },
  {
    icon: '🎨',
    title: 'Theme Commands',
    description:
      'Apply themes with simple commands. Dark neon terminal? Cyberpunk? Just type it.',
  },
  {
    icon: '🚀',
    title: 'Instant Deploy',
    description: 'Deploy your website with a single command. Get a live URL in seconds.',
  },
  {
    icon: '🎫',
    title: 'Mint as NFT',
    description: 'Turn your website project into an NFT on RobinHood. Own your creation onchain.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          Why <span className="text-primary">Gitart</span>
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          The future of website building is here. No more drag and drop.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6 hover:border-primary/40 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
