/**
 * Client helpers for logo/image.
 * Server fetches a real web photo on demand (stock) — no pre-download, no AI key required.
 */

export function buildLogoPrompt(idea: string): string {
  const subject = (idea || 'mascot').trim().slice(0, 60)
  return `cute cartoon mascot logo for "${subject}", simple flat design, kawaii style, minimal, vector art, solid background, icon style, high quality, professional logo design`
}

export function buildPollinationsLogoUrl(idea: string, seed?: number): string {
  const prompt = buildLogoPrompt(idea)
  const s = seed ?? Date.now()
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${s}&nologo=true&enhance=false`
}

export function buildSimplePollinationsUrl(idea: string, seed?: number): string {
  const subject = (idea || 'mascot').trim().slice(0, 40)
  const s = seed ?? Date.now()
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(`cute cartoon ${subject} mascot logo kawaii`)}?width=512&height=512&seed=${s}&nologo=true`
}

export function buildRealisticPollinationsUrl(idea: string, seed?: number): string {
  const subject = (idea || 'subject').trim().slice(0, 60)
  const s = seed ?? Date.now()
  const prompt = `Photorealistic high-quality photo of ${subject}, detailed, sharp focus, natural lighting, 8k, no text, no watermark`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${s}&nologo=true`
}

const SUBJECT_EMOJI: Array<{ re: RegExp; emoji: string; label: string }> = [
  { re: /\b(dog|puppy|doge|shiba|husky|corgi)\b/i, emoji: '🐶', label: 'Dog' },
  { re: /\b(cat|kitten|kitty|neko)\b/i, emoji: '🐱', label: 'Cat' },
  { re: /\b(frog|pepe|toad)\b/i, emoji: '🐸', label: 'Frog' },
  { re: /\b(fox)\b/i, emoji: '🦊', label: 'Fox' },
  { re: /\b(bear)\b/i, emoji: '🐻', label: 'Bear' },
  { re: /\b(panda)\b/i, emoji: '🐼', label: 'Panda' },
  { re: /\b(rabbit|bunny)\b/i, emoji: '🐰', label: 'Rabbit' },
  { re: /\b(monkey|ape)\b/i, emoji: '🐵', label: 'Monkey' },
  { re: /\b(pig)\b/i, emoji: '🐷', label: 'Pig' },
  { re: /\b(cow|bull)\b/i, emoji: '🐮', label: 'Cow' },
  { re: /\b(lion)\b/i, emoji: '🦁', label: 'Lion' },
  { re: /\b(tiger)\b/i, emoji: '🐯', label: 'Tiger' },
  { re: /\b(dragon)\b/i, emoji: '🐉', label: 'Dragon' },
  { re: /\b(unicorn)\b/i, emoji: '🦄', label: 'Unicorn' },
  { re: /\b(bird|eagle|owl|chicken)\b/i, emoji: '🐦', label: 'Bird' },
  { re: /\b(fish|shark|whale)\b/i, emoji: '🐟', label: 'Fish' },
  { re: /\b(rocket|space)\b/i, emoji: '🚀', label: 'Rocket' },
  { re: /\b(robot|bot|ai)\b/i, emoji: '🤖', label: 'Robot' },
  { re: /\b(coin|token|crypto|meme)\b/i, emoji: '🪙', label: 'Coin' },
  { re: /\b(moon)\b/i, emoji: '🌙', label: 'Moon' },
  { re: /\b(fire|flame)\b/i, emoji: '🔥', label: 'Fire' },
  { re: /\b(ghost)\b/i, emoji: '👻', label: 'Ghost' },
  { re: /\b(alien)\b/i, emoji: '👽', label: 'Alien' },
  { re: /\b(skull)\b/i, emoji: '💀', label: 'Skull' },
  { re: /\b(heart|love)\b/i, emoji: '💚', label: 'Heart' },
]

export function matchSubjectEmoji(idea: string): { emoji: string; label: string } {
  const text = idea || 'mascot'
  for (const row of SUBJECT_EMOJI) {
    if (row.re.test(text)) return { emoji: row.emoji, label: row.label }
  }
  const ch = text.trim().charAt(0).toUpperCase() || 'G'
  return { emoji: ch, label: text.slice(0, 16) }
}

export function generateSubjectLogoDataUrl(idea: string): string {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const { emoji } = matchSubjectEmoji(idea)
  const title = (idea || 'Logo').trim().slice(0, 22)

  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#06140a')
  grad.addColorStop(0.5, '#0d2a16')
  grad.addColorStop(1, '#020203')
  ctx.fillStyle = grad
  roundRect(ctx, 0, 0, size, size, 56)
  ctx.fill()

  ctx.shadowColor = '#57cb60'
  ctx.shadowBlur = 50
  ctx.beginPath()
  ctx.arc(size / 2, 210, 120, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(87, 203, 96, 0.18)'
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.arc(size / 2, 210, 115, 0, Math.PI * 2)
  ctx.fillStyle = '#0a1f12'
  ctx.fill()
  ctx.lineWidth = 6
  ctx.strokeStyle = '#57cb60'
  ctx.stroke()

  ctx.font = '160px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, 218)

  ctx.fillStyle = '#57cb60'
  ctx.font = 'bold 28px "JetBrains Mono", monospace'
  ctx.fillText(title, size / 2, 380)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '14px "JetBrains Mono", monospace'
  ctx.fillText('fallback · web photo unavailable', size / 2, 420)

  return canvas.toDataURL('image/png')
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export type ImageStyle = 'realistic' | 'mascot'

export type LogoResult = {
  url: string
  aiUrl?: string
  via: string
  model?: string
  style: ImageStyle
  error?: string
}

/**
 * Ask server for an on-demand web photo matching `idea`
 * (e.g. "dog" → fetch a real dog photo right now, not pre-stored).
 */
export async function resolveLogoImageUrl(
  idea: string,
  style: ImageStyle = 'realistic',
): Promise<LogoResult> {
  const fallback = generateSubjectLogoDataUrl(idea)

  try {
    const controller = new AbortController()
    const t = window.setTimeout(() => controller.abort(), 30_000)
    const res = await fetch('/api/generate-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, style }),
      signal: controller.signal,
    })
    window.clearTimeout(t)

    const ct = res.headers.get('content-type') || ''
    if (!res.ok) {
      const errBody = ct.includes('json') ? await res.json().catch(() => ({})) : {}
      return {
        url: fallback,
        via: 'fallback-emoji',
        style,
        error: (errBody as { error?: string }).error || `HTTP ${res.status}`,
      }
    }

    if (ct.includes('application/json')) {
      const data = (await res.json()) as {
        imageUrl?: string
        via?: string
        model?: string
        error?: string
      }
      if (data.imageUrl?.startsWith('data:image/')) {
        return {
          url: data.imageUrl,
          via: data.via || 'stock',
          model: data.model,
          style,
        }
      }
      if (data.imageUrl?.startsWith('http')) {
        return {
          url: data.imageUrl,
          via: data.via || 'stock',
          model: data.model,
          style,
        }
      }
    }
  } catch (err) {
    return {
      url: fallback,
      via: 'fallback-emoji',
      style,
      error: err instanceof Error ? err.message : 'request failed',
    }
  }

  return { url: fallback, via: 'fallback-emoji', style }
}

export function tryLoadAiImage(url: string, timeoutMs = 28_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('timeout'))
    }, timeoutMs)

    const cleanup = () => {
      window.clearTimeout(timer)
      img.onload = null
      img.onerror = null
    }

    img.onload = () => {
      cleanup()
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth || 512
        c.height = img.naturalHeight || 512
        const ctx = c.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(c.toDataURL('image/png'))
          return
        }
      } catch {
        /* tainted */
      }
      resolve(url)
    }
    img.onerror = () => {
      cleanup()
      reject(new Error('load failed'))
    }
    img.src = url
  })
}

export type ProviderInfo = {
  available: boolean
  free: boolean
  quality: string
  name: string
}

export async function fetchProviders(): Promise<Record<string, ProviderInfo>> {
  try {
    const res = await fetch('/api/providers')
    if (!res.ok) return {}
    const data = (await res.json()) as { providers?: Record<string, ProviderInfo> }
    return data.providers || {}
  } catch {
    return {}
  }
}
