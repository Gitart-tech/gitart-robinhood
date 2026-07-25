import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildSimplePollinationsUrl,
  resolveLogoImageUrl,
  tryLoadAiImage,
  type ImageStyle,
} from '../lib/generateLogo'
import { slugify } from '../lib/utils'

type LineType = 'header' | 'success' | 'command' | 'section' | 'detail' | 'info' | 'system' | 'image'

type Line = {
  text: string
  type: LineType
  delay?: number
  imageUrl?: string
}

type TerminalModalProps = {
  isOpen: boolean
  onClose: () => void
}

function lineClass(type: LineType) {
  switch (type) {
    case 'header':
      return 'text-primary font-bold'
    case 'success':
      return 'text-primary'
    case 'command':
      return 'text-[#2aa8b0]'
    case 'section':
      return 'text-[#e0c35a]'
    case 'detail':
    case 'info':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
}

function createProjectLines(idea: string): Line[] {
  return [
    { text: '', type: 'system', delay: 300 },
    { text: '... Initializing Gitart...', type: 'info', delay: 400 },
    { text: '... Connecting to RobinHood network...', type: 'info', delay: 500 },
    { text: '... Validating project configuration...', type: 'info', delay: 400 },
    { text: '', type: 'system', delay: 200 },
    { text: '[OK] Project created', type: 'success', delay: 300 },
    { text: '[OK] Hero generated', type: 'success', delay: 250 },
    { text: '[OK] Tokenomics generated', type: 'success', delay: 250 },
    { text: '[OK] Roadmap generated', type: 'success', delay: 250 },
    { text: '[OK] Community section generated', type: 'success', delay: 250 },
    { text: '[OK] RobinHood wallet CTA added', type: 'success', delay: 300 },
    { text: '', type: 'system', delay: 200 },
    { text: 'Run:', type: 'system', delay: 150 },
    { text: '  gitart preview', type: 'command', delay: 100 },
    { text: '  gitart edit', type: 'command', delay: 100 },
    { text: '  gitart deploy', type: 'command', delay: 100 },
    { text: '', type: 'system', delay: 200 },
    { text: `PROJECT: ${idea}`, type: 'section', delay: 150 },
    { text: 'CHAIN: RobinHood', type: 'section', delay: 100 },
    { text: `TYPE: ${idea}`, type: 'section', delay: 100 },
    { text: '', type: 'system', delay: 200 },
    { text: '[Hero]', type: 'header', delay: 150 },
    { text: `  Title: ${idea}`, type: 'detail', delay: 100 },
    { text: '  CTA: Buy on RobinHood', type: 'detail', delay: 100 },
    { text: '', type: 'system', delay: 150 },
    { text: '[Tokenomics]', type: 'header', delay: 150 },
    { text: '  Supply: 1B', type: 'detail', delay: 100 },
    { text: '  Tax: 0%', type: 'detail', delay: 100 },
    { text: '  Liquidity: Locked', type: 'detail', delay: 100 },
    { text: '', type: 'system', delay: 150 },
    { text: '[Roadmap]', type: 'header', delay: 150 },
    { text: '  Phase 1: Launch', type: 'detail', delay: 100 },
    { text: '  Phase 2: Community', type: 'detail', delay: 100 },
    { text: '  Phase 3: RobinHood ecosystem', type: 'detail', delay: 100 },
    { text: '', type: 'system', delay: 200 },
    { text: '[OK] Website ready!', type: 'success', delay: 300 },
    { text: 'Run "gitart deploy" to publish on RobinHood', type: 'info', delay: 200 },
    { text: '', type: 'system', delay: 200 },
    { text: 'Want a logo? Type:', type: 'system', delay: 150 },
    { text: `  gitart create logo "${idea}"`, type: 'command', delay: 100 },
  ]
}

const WELCOME: Line[] = [
  { text: 'Welcome to Gitart.', type: 'header' },
  { text: 'AI Website Builder on RobinHood.', type: 'info' },
  { text: 'Images: real web photos, fetched on demand.', type: 'info' },
  { text: '', type: 'system' },
  { text: 'Type:', type: 'system' },
  { text: 'gitart create "your website idea"', type: 'command' },
]

function LogoPreview({
  src,
  aiUrl,
  idea,
  onReady,
  onDownload,
}: {
  src: string
  aiUrl?: string
  idea: string
  onReady: (url: string) => void
  onDownload: () => void
}) {
  const [displaySrc, setDisplaySrc] = useState(src)
  const [phase, setPhase] = useState<'instant' | 'upgrading' | 'ai' | 'done'>('instant')

  useEffect(() => {
    setDisplaySrc(src)
    setPhase(aiUrl ? 'upgrading' : 'done')
    onReady(src)

    if (!aiUrl) return

    let cancelled = false
    ;(async () => {
      try {
        // Try AI image in background; upgrade preview when ready
        const loaded = await tryLoadAiImage(aiUrl, 28_000)
        if (cancelled) return
        setDisplaySrc(loaded)
        setPhase('ai')
        onReady(loaded)
      } catch {
        // Second chance: shorter prompt
        try {
          const simple = buildSimplePollinationsUrl(idea)
          const loaded = await tryLoadAiImage(simple, 20_000)
          if (cancelled) return
          setDisplaySrc(loaded)
          setPhase('ai')
          onReady(loaded)
        } catch {
          if (!cancelled) setPhase('done') // keep instant mascot
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, aiUrl, idea])

  return (
    <div className="my-3 flex flex-col gap-2">
      <div className="relative w-44 h-44 rounded-lg border border-primary/40 bg-secondary overflow-hidden shadow-[0_0_20px_rgba(87,203,96,0.25)]">
        <img
          src={displaySrc}
          alt={`Logo for ${idea}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        {phase === 'upgrading' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-primary px-2 py-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin" />
            AI rendering full mascot
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="self-start text-xs text-primary hover:underline"
        >
           " download logo
        </button>
        {phase === 'ai' && (
          <span className="text-[10px] text-muted-foreground">AI mascot ready</span>
        )}
        {phase === 'done' && !aiUrl && (
          <span className="text-[10px] text-muted-foreground">subject mascot</span>
        )}
      </div>
    </div>
  )
}

export function TerminalModal({ isOpen, onClose }: TerminalModalProps) {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [typingIdx, setTypingIdx] = useState(-1)
  const [typedText, setTypedText] = useState('')
  const [readyDeploy, setReadyDeploy] = useState(false)
  const [lastLogoUrl, setLastLogoUrl] = useState<string | null>(null)
  const [lastAiUrl, setLastAiUrl] = useState<string | undefined>(undefined)
  const [lastIdea, setLastIdea] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setLines(WELCOME)
      setInput('')
      setBusy(false)
      setShowInput(true)
      setTypingIdx(-1)
      setTypedText('')
      setReadyDeploy(false)
      setLastLogoUrl(null)
      setLastAiUrl(undefined)
      setLastIdea('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, typedText, readyDeploy])

  const playLines = useCallback(async (sequence: Line[]) => {
    for (let i = 0; i < sequence.length; i++) {
      const line = sequence[i]

      // Skip character typing for images / empty lines / very long text
      const skipTyping =
        line.type === 'image' || !line.text || line.text.length > 80 || line.text.startsWith('data:')

      if (!skipTyping) {
        setTypingIdx(i)
        const full = line.text
        for (let c = 0; c <= full.length; c++) {
          setTypedText(full.slice(0, c))
          await new Promise((r) => setTimeout(r, 6))
        }
        setTypedText('')
        setTypingIdx(-1)
      }

      setLines((prev) => [...prev, line])
      await new Promise((r) => setTimeout(r, line.delay || 80))
    }
  }, [])

  const handleCreate = useCallback(
    async (idea: string) => {
      setBusy(true)
      setShowInput(false)
      await playLines(createProjectLines(idea))
      setBusy(false)
      setShowInput(true)
      setReadyDeploy(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    [playLines],
  )

  const handleLogo = useCallback(async (idea: string, style: ImageStyle = 'realistic') => {
    setBusy(true)
    setShowInput(false)

    setLines((prev) => [
      ...prev,
      { text: '', type: 'system' },
      { text: '... Searching the web for a matching photo...', type: 'info' },
      { text: `" Keyword: "${idea}"`, type: 'info' },
      { text: '... Fetching on demand (not pre-downloaded)...', type: 'info' },
    ])

    try {
      const result = await resolveLogoImageUrl(idea, style)
      setLastLogoUrl(result.url)
      setLastIdea(idea)
      setLastAiUrl(undefined)

      const ok = result.url.startsWith('data:image/') || result.url.startsWith('http')
      const isStock = result.via === 'stock' || !result.via.includes('fallback')

      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: '[OK] Image ready!', type: 'success' },
        { text: `[OK] Subject: ${idea}`, type: 'success' },
        {
          text: `[OK] Source: ${result.via}${result.model ? `  ${result.model}` : ''}`,
          type: 'info',
        },
        ...(isStock && ok
          ? [
              {
                text: '[OK] Real photo pulled from the internet just now',
                type: 'success' as const,
              },
            ]
          : [{ text: '[!] Used local fallback (web fetch failed)', type: 'info' as const }]),
        ...(result.error
          ? [{ text: `  ${result.error}`, type: 'info' as const }]
          : []),
        { text: '', type: 'system' },
        { text: 'Preview:', type: 'header' },
        { text: 'photo.jpg', type: 'image', imageUrl: result.url },
        { text: '', type: 'system' },
        { text: 'Run:', type: 'system' },
        { text: '  gitart download-logo', type: 'command' },
        { text: '  gitart apply-logo', type: 'command' },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: ` Error: ${msg}`, type: 'info' },
        { text: '  gitart create logo "dog"', type: 'command' },
      ])
    }

    setBusy(false)
    setShowInput(true)
    setReadyDeploy(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const downloadLogo = useCallback(async () => {
    if (!lastLogoUrl) return
    try {
      // Cross-origin Pollinations URLs need fetch  ' blob for a real download
      const res = await fetch(lastLogoUrl)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'gitart-logo.png'
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(lastLogoUrl, '_blank', 'noopener,noreferrer')
    }
  }, [lastLogoUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = input.trim()
    if (!raw || busy) return

    // download-logo
    if (/^gitart\s+download-logo$/i.test(raw)) {
      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: `>_ ${raw}`, type: 'command' },
      ])
      setInput('')
      if (lastLogoUrl) {
        downloadLogo()
        setLines((prev) => [
          ...prev,
          { text: '[OK] Logo downloaded as gitart-logo.png', type: 'success' },
        ])
      } else {
        setLines((prev) => [
          ...prev,
          { text: '[!] No logo yet. Run: gitart create logo "your idea"', type: 'info' },
        ])
      }
      return
    }

    // apply-logo
    if (/^gitart\s+apply-logo$/i.test(raw)) {
      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: `>_ ${raw}`, type: 'command' },
      ])
      setInput('')
      if (lastLogoUrl) {
        setLines((prev) => [
          ...prev,
          { text: '[OK] Logo applied to project Hero section', type: 'success' },
          { text: '[OK] Assets updated on RobinHood chain metadata', type: 'success' },
        ])
      } else {
        setLines((prev) => [
          ...prev,
          { text: '[!] No logo yet. Run: gitart create logo "your idea"', type: 'info' },
        ])
      }
      return
    }

    // gitart create logo "idea" [--realistic|--mascot]
    const logoMatch = raw.match(
      /gitart\s+create\s+logo\s+["'](.+?)["'](?:\s+(--realistic|--mascot|--cartoon))?/i,
    )
    if (logoMatch) {
      const idea = logoMatch[1]
      const flag = (logoMatch[2] || '').toLowerCase()
      const style: ImageStyle =
        flag === '--mascot' || flag === '--cartoon' ? 'mascot' : 'realistic'
      setShowInput(false)
      setBusy(true)
      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: `>_ gitart create logo "${idea}"${flag ? ` ${flag}` : ''}`, type: 'command' },
      ])
      setInput('')
      void handleLogo(idea, style)
      return
    }

    // Loose: gitart create logo dog --realistic
    const logoLoose = raw.match(/^gitart\s+create\s+logo\s+(.+)$/i)
    if (logoLoose && !logoMatch) {
      let rest = logoLoose[1].trim()
      let style: ImageStyle = 'realistic'
      if (/\s--mascot\b/i.test(rest) || /\s--cartoon\b/i.test(rest)) {
        style = 'mascot'
        rest = rest.replace(/\s--(mascot|cartoon)\b/gi, '')
      }
      if (/\s--realistic\b/i.test(rest)) {
        style = 'realistic'
        rest = rest.replace(/\s--realistic\b/gi, '')
      }
      const idea = rest.replace(/^["']|["']$/g, '').trim()
      if (idea) {
        setShowInput(false)
        setBusy(true)
        setLines((prev) => [
          ...prev,
          { text: '', type: 'system' },
          { text: `>_ gitart create logo "${idea}"`, type: 'command' },
        ])
        setInput('')
        void handleLogo(idea, style)
        return
      }
    }

    const createMatch = raw.match(/gitart\s+create\s+["'](.+?)["']/i)
    if (!createMatch) {
      // loose create without quotes
      const createLoose = raw.match(/^gitart\s+create\s+(.+)$/i)
      if (createLoose && !/^logo\b/i.test(createLoose[1])) {
        const idea = createLoose[1].replace(/^["']|["']$/g, '').trim()
        if (idea) {
          setShowInput(false)
          setBusy(true)
          setLines((prev) => [
            ...prev,
            { text: '', type: 'system' },
            { text: `>_ gitart create "${idea}"`, type: 'command' },
          ])
          setInput('')
          void handleCreate(idea)
          return
        }
      }

      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: `>_ ${raw}`, type: 'command' },
        { text: 'Error: Invalid command. Use:', type: 'info' },
        { text: '  gitart create "your idea"', type: 'command' },
        { text: '  gitart create logo "dog"', type: 'command' },
        { text: '  gitart create logo "dog" --realistic', type: 'command' },
        { text: '  gitart create logo "dog" --mascot', type: 'command' },
      ])
      setInput('')
      return
    }

    const idea = createMatch[1]
    setShowInput(false)
    setBusy(true)
    setLines((prev) => [
      ...prev,
      { text: '', type: 'system' },
      { text: `>_ gitart create "${idea}"`, type: 'command' },
    ])
    setInput('')
    void handleCreate(idea)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-border bg-[#010202] shadow-2xl overflow-hidden terminal-glow">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0d12] border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500"
                  aria-label="Close"
                />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                user@gitart - ~/projects/{slugify(input) || 'new'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xs px-2 py-1"
            >
              ESC
            </button>
          </div>

          <div
            ref={scrollRef}
            className="p-4 text-sm leading-relaxed h-[min(60vh,420px)] overflow-y-auto scanline relative"
          >
            {lines.map((line, i) =>
              line.type === 'image' && line.imageUrl ? (
                <LogoPreview
                  key={`${i}-${line.imageUrl.slice(0, 32)}`}
                  src={line.imageUrl}
                  aiUrl={lastAiUrl}
                  idea={lastIdea || 'mascot'}
                  onReady={(url) => setLastLogoUrl(url)}
                  onDownload={downloadLogo}
                />
              ) : (
                <div key={i} className={`${lineClass(line.type)} leading-relaxed min-h-[1.25rem]`}>
                  {line.text || '\u00A0'}
                </div>
              ),
            )}

            {typingIdx >= 0 && (
              <div className={`${lineClass('system')} leading-relaxed`}>
                {typedText}
                <span className="typing-cursor" />
              </div>
            )}

            {showInput && !busy && (
              <form onSubmit={handleSubmit} className="flex items-center mt-2">
                <span className="text-primary mr-2 font-semibold">{'>_'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                  placeholder='gitart create "your website idea"'
                  autoFocus
                />
                <span className="typing-cursor" />
              </form>
            )}

            {busy && (
              <div className="mt-2 text-muted-foreground text-xs flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                working...
              </div>
            )}

            {readyDeploy && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-primary">Ready to deploy!</span>
                  <span className="text-muted-foreground">Push to GitHub to continue</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="https://github.com/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.24 3.22c0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Push to GitHub
                  </a>
                  {lastLogoUrl && (
                    <button
                      type="button"
                      onClick={downloadLogo}
                      className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/10 h-9 rounded-md px-4 text-sm font-medium transition-colors"
                    >
                      Download Logo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Enter</kbd> to execute
          command  <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">ESC</kbd> / red dot
          to close
        </p>
      </div>
    </div>
  )
}
