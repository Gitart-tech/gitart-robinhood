import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type TerminalWindowProps = {
  username?: string
  hostname?: string
  path?: string
  className?: string
  children: ReactNode
  onClose?: () => void
  showClose?: boolean
}

export function TerminalWindow({
  username = 'user',
  hostname = 'gitart',
  path = '~/projects/new',
  className,
  children,
  onClose,
  showClose = false,
}: TerminalWindowProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card overflow-hidden terminal-glow',
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
            aria-label={showClose ? 'Close' : undefined}
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto font-mono">
          {username}@{hostname} — {path}
        </span>
      </div>
      <div className="p-4 text-sm leading-relaxed scanline relative">{children}</div>
    </div>
  )
}

type TerminalLineProps = {
  command?: string
  output?: string
  success?: boolean
  info?: boolean
  url?: boolean
  progress?: string
}

export function TerminalLine({
  command,
  output,
  success,
  info,
  url,
  progress,
}: TerminalLineProps) {
  if (command !== undefined) {
    return (
      <div className="flex items-start gap-2 mb-1">
        <span className="text-primary shrink-0 font-semibold">{'>_'}</span>
        <span className="text-foreground">{command}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 mb-1 ml-0">
      {progress && (
        <span className="text-muted-foreground shrink-0 text-xs">{progress}</span>
      )}
      <span
        className={cn(
          url && 'text-primary underline',
          success && 'text-primary',
          info && !success && !url && 'text-muted-foreground',
          !success && !info && !url && 'text-foreground',
        )}
      >
        {output}
      </span>
    </div>
  )
}
