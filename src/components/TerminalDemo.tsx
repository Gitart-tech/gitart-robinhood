import { useEffect, useRef, useState } from 'react'
import { TerminalLine, TerminalWindow } from './TerminalWindow'
import { cn } from '../lib/utils'

type DemoStep = {
  command?: string
  output?: string
  success?: boolean
  info?: boolean
  url?: boolean
  progress?: string
  blank?: boolean
  delay: number
  typeSpeed?: number
}

const DEMO_SEQUENCE: DemoStep[] = [
  { command: 'gitart init', delay: 100, typeSpeed: 50 },
  { output: 'Gitart v1.0.0 - AI website builder terminal', info: true, delay: 400 },
  { output: 'Connected to RobinHood mainnet [OK]', success: true, delay: 300 },
  { blank: true, delay: 200 },
  {
    command: 'create --name "RobinHoodMeme" --template meme-coin',
    delay: 600,
    typeSpeed: 40,
  },
  { output: 'Validating parameters...', progress: '[1/4]', info: true, delay: 400 },
  { output: 'Generating with AI...', progress: '[2/4]', info: true, delay: 500 },
  { output: 'Creating project structure...', progress: '[3/4]', info: true, delay: 400 },
  { output: 'Applying theme...', progress: '[4/4]', info: true, delay: 400 },
  { output: '[OK] Project created successfully!', success: true, delay: 500 },
  { blank: true, delay: 200 },
  { output: 'Preview: http://localhost:3000', info: true, delay: 100 },
  { blank: true, delay: 400 },
  { command: 'deploy --network robinhood', delay: 600, typeSpeed: 45 },
  { output: 'Building project...', progress: '[1/3]', info: true, delay: 500 },
  { output: 'Uploading to IPFS...', progress: '[2/3]', info: true, delay: 600 },
  { output: 'Registering on RobinHood...', progress: '[3/3]', info: true, delay: 500 },
  { output: '[OK] Deployed successfully!', success: true, delay: 400 },
  { blank: true, delay: 200 },
  { output: 'URL: https://robinhoodmeme.gitart.app', url: true, delay: 100 },
  { output: 'IPFS: ipfs://Qm7x...3f2a', info: true, delay: 0 },
]

export function TerminalDemo({ className }: { className?: string }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [history, setHistory] = useState<DemoStep[]>([])
  const stepIndexRef = useRef(0)

  useEffect(() => {
    stepIndexRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms)
      })

    const run = async () => {
      // Loop forever until unmount
      while (!cancelled) {
        // reset cycle
        if (!cancelled) {
          setHistory([])
          setTyped('')
          setIsTyping(false)
          setStepIndex(0)
          stepIndexRef.current = 0
        }

        for (let idx = 0; idx < DEMO_SEQUENCE.length; idx++) {
          if (cancelled) return
          setStepIndex(idx)
          stepIndexRef.current = idx
          const step = DEMO_SEQUENCE[idx]

          if (step.command) {
            setIsTyping(true)
            setTyped('')
            const full = step.command
            const speed = step.typeSpeed ?? 50
            for (let i = 1; i <= full.length; i++) {
              if (cancelled) return
              setTyped(full.slice(0, i))
              await wait(speed + 20 * Math.random())
            }
            setIsTyping(false)
            await wait(250)
            if (cancelled) return
            setHistory((h) => [...h, step])
            setTyped('')
          } else {
            await wait(step.delay || 100)
            if (cancelled) return
            setHistory((h) => [...h, step])
          }
        }

        // pause before loop
        await wait(3000)
      }
    }

    void run()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  const current = DEMO_SEQUENCE[stepIndex]

  return (
    <TerminalWindow
      username="user"
      hostname="gitart"
      path="~/projects/new"
      className={cn('max-w-2xl mx-auto', className)}
    >
      <div className="min-h-[360px]">
        {history.map((step, i) =>
          step.blank ? (
            <div key={i} className="h-3" />
          ) : step.command ? (
            <TerminalLine key={i} command={step.command} />
          ) : step.url ? (
            <TerminalLine key={i} output={step.output} url />
          ) : (
            <TerminalLine
              key={i}
              output={step.output}
              success={step.success}
              info={step.info}
              progress={step.progress}
            />
          ),
        )}
        {current?.command && (isTyping || typed) && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary shrink-0 font-semibold">{'>_'}</span>
            <span className="text-foreground">
              {typed}
              {isTyping && <span className="animate-blink">|</span>}
            </span>
          </div>
        )}
        {current && !current.command && !isTyping && (
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">{'>_'}</span>
            <span className="animate-blink">|</span>
          </div>
        )}
      </div>
    </TerminalWindow>
  )
}
