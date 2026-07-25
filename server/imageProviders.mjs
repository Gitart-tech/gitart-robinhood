/**
 * Image source: on-demand stock photos from the public web.
 *
 * No pre-download / no local image library.
 * When the user runs: gitart create logo "dog"
 *   → server fetches a matching photo RIGHT THEN from the internet
 *   → returns base64 to the browser (not saved to disk unless user downloads)
 *
 * AI image APIs are optional and off by default (USE_AI_IMAGE=1 to enable).
 */

/** @type {Map<string, { until: number, reason: string }>} */
const depleted = new Map()

function markDepleted(id, reason, minutes = 60) {
  depleted.set(id, { until: Date.now() + minutes * 60_000, reason })
  console.warn(`[image] provider "${id}" marked depleted: ${reason}`)
}

function isDepleted(id) {
  const row = depleted.get(id)
  if (!row) return false
  if (Date.now() > row.until) {
    depleted.delete(id)
    return false
  }
  return true
}

export function buildRealisticPrompt(idea) {
  const subject = String(idea || 'subject').trim().slice(0, 100)
  // Strong photorealism prompt (works well with FLUX)
  return [
    `Ultra realistic professional photograph of ${subject}`,
    'photorealistic, natural skin and fur texture, sharp focus',
    'cinematic lighting, shallow depth of field, 85mm lens',
    'high detail, 8k resolution, DSLR photo, true to life colors',
    'centered subject, clean background, masterpiece',
    'no text, no watermark, no logo, no cartoon, no illustration, no drawing',
  ].join(', ')
}

export function buildMascotPrompt(idea) {
  const subject = String(idea || 'mascot').trim().slice(0, 80)
  return [
    `adorable high-quality cartoon mascot character of ${subject}`,
    'polished vector logo style, kawaii, vibrant colors',
    'soft studio lighting, clean solid background',
    'professional brand mascot, centered, highly detailed',
    'no text, no watermark, no letters',
  ].join(', ')
}

function pickStyle(body) {
  const style = String(body?.style || 'realistic').toLowerCase()
  return style === 'mascot' || style === 'cartoon' ? 'mascot' : 'realistic'
}

export function resolvePrompt(idea, body) {
  return pickStyle(body) === 'mascot' ? buildMascotPrompt(idea) : buildRealisticPrompt(idea)
}

export function listProviders() {
  const gemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  const hf = !!(process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY)
  const xai = !!process.env.XAI_API_KEY
  return {
    stock: {
      available: !isDepleted('stock'),
      configured: true,
      free: true,
      quality: 'photo',
      name: 'Real web photos (stock by keyword)',
      depleted: isDepleted('stock'),
    },
    gemini: {
      available: gemini && !isDepleted('gemini'),
      configured: gemini,
      free: true,
      quality: 'high',
      name: 'Google Gemini Flash Image',
      depleted: isDepleted('gemini'),
      depleteReason: depleted.get('gemini')?.reason,
    },
    huggingface: {
      available: hf && !isDepleted('huggingface'),
      configured: hf,
      free: true,
      quality: 'very-high',
      name: 'Hugging Face FLUX',
      depleted: isDepleted('huggingface'),
      depleteReason: depleted.get('huggingface')?.reason,
    },
    xai: {
      available: xai && !isDepleted('xai'),
      configured: xai,
      free: false,
      quality: 'very-high',
      name: 'xAI Grok Imagine',
      depleted: isDepleted('xai'),
    },
    pollinations: {
      available: !isDepleted('pollinations'),
      configured: true,
      free: true,
      quality: 'high',
      name: 'Pollinations FLUX (free)',
      depleted: isDepleted('pollinations'),
    },
  }
}

/**
 * Default: only stock (on-demand web photos).
 * Set USE_AI_IMAGE=1 to also try Gemini/HF/xAI/Pollinations after stock.
 */
export function chooseProviderOrder(preferred) {
  const providers = listProviders()
  const useAi = process.env.USE_AI_IMAGE === '1' || process.env.USE_AI_IMAGE === 'true'
  // Stock only by default — fetch from internet when command runs
  const base = useAi
    ? ['stock', 'gemini', 'huggingface', 'xai', 'pollinations']
    : ['stock']
  const order = preferred ? [preferred, ...base] : base
  const seen = new Set()
  const out = []
  for (const id of order) {
    if (seen.has(id)) continue
    seen.add(id)
    if (providers[id]?.available) out.push(id)
  }
  if (!out.includes('stock') && !isDepleted('stock')) out.unshift('stock')
  return out
}

async function bufferToDataUrl(buf, mime = 'image/png') {
  return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
}

async function downloadImageAsDataUrl(url, timeoutMs = 20_000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'image/*,*/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`download ${res.status}`)
    const ct = (res.headers.get('content-type') || '').split(';')[0]
    // Skip video/gif if huge weird
    if (ct.includes('video')) throw new Error('got video not image')
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 2000) throw new Error('image too small')
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8
    const isPng = buf[0] === 0x89 && buf[1] === 0x50
    const isWebp = buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP'
    const isGif = buf[0] === 0x47 && buf[1] === 0x49
    if (!isJpeg && !isPng && !isWebp && !isGif) throw new Error('not a valid image')
    const mime = isPng
      ? 'image/png'
      : isWebp
        ? 'image/webp'
        : isGif
          ? 'image/gif'
          : ct.startsWith('image/')
            ? ct
            : 'image/jpeg'
    return bufferToDataUrl(buf, mime)
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

/** Extract a clean search keyword from user idea */
export function extractKeyword(idea) {
  let text = String(idea || 'nature').trim().toLowerCase()
  // strip common noise words
  text = text
    .replace(/["']/g, '')
    .replace(
      /\b(a|an|the|photo|of|image|picture|logo|mascot|cute|realistic|photorealistic|ultra|high|quality|professional)\b/gi,
      ' ',
    )
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const words = text.split(' ').filter(Boolean)
  // Prefer animal/object words, keep 1–3 tokens for search
  return (words.slice(0, 3).join(' ') || 'animal').slice(0, 40)
}

/**
 * Real photos from the public web matched to the keyword.
 * dog → dog.ceo / loremflickr dog, cat → cat API, else loremflickr / wikimedia.
 */
export async function generateWithStock(idea) {
  const keyword = extractKeyword(idea)
  const errors = []

  // 1) Specialized free animal APIs
  const special = await trySpecialAnimalApis(keyword)
  if (special) return special

  // 2) LoremFlickr — random real photo tagged with keyword
  try {
    const tag = encodeURIComponent(keyword.replace(/\s+/g, ','))
    const lock = Math.floor(Math.random() * 1e9)
    // lock param randomizes which image; size 800 looks good
    const url = `https://loremflickr.com/800/800/${tag}?lock=${lock}`
    const imageUrl = await downloadImageAsDataUrl(url)
    return {
      imageUrl,
      via: 'stock',
      model: `loremflickr/${keyword}`,
    }
  } catch (err) {
    errors.push(`loremflickr: ${err instanceof Error ? err.message : err}`)
  }

  // 3) Wikimedia Commons search
  try {
    const wiki = await fetchWikimediaImage(keyword)
    if (wiki) return wiki
  } catch (err) {
    errors.push(`wikimedia: ${err instanceof Error ? err.message : err}`)
  }

  // 4) Unsplash-style via picsum (not keyword-specific but always works)
  try {
    const seed = encodeURIComponent(keyword + Date.now())
    const imageUrl = await downloadImageAsDataUrl(
      `https://picsum.photos/seed/${seed}/800/800`,
    )
    return { imageUrl, via: 'stock', model: `picsum/${keyword}` }
  } catch (err) {
    errors.push(`picsum: ${err instanceof Error ? err.message : err}`)
  }

  throw new Error(`stock failed: ${errors.join(' | ')}`)
}

async function trySpecialAnimalApis(keyword) {
  const k = keyword.toLowerCase()

  // Dogs
  if (/\b(dog|puppy|doge|husky|corgi|retriever|labrador|shiba|bulldog|poodle|beagle)\b/.test(k)) {
    try {
      // Try breed-specific if we can map
      let api = 'https://dog.ceo/api/breeds/image/random'
      if (/\bhusky\b/.test(k)) api = 'https://dog.ceo/api/breed/husky/images/random'
      else if (/\bretriever|labrador\b/.test(k))
        api = 'https://dog.ceo/api/breed/retriever/golden/images/random'
      else if (/\bpoodle\b/.test(k)) api = 'https://dog.ceo/api/breed/poodle/images/random'
      else if (/\bbeagle\b/.test(k)) api = 'https://dog.ceo/api/breed/beagle/images/random'
      else if (/\bcorgi\b/.test(k)) api = 'https://dog.ceo/api/breed/corgi/images/random'
      else if (/\bshiba\b/.test(k)) api = 'https://dog.ceo/api/breed/shiba/images/random'

      const res = await fetch(api, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      })
      const data = await res.json()
      const photoUrl = data?.message
      if (typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
        // skip video
        if (/\.(mp4|webm)$/i.test(photoUrl)) throw new Error('video')
        const imageUrl = await downloadImageAsDataUrl(photoUrl)
        return { imageUrl, via: 'stock', model: 'dog.ceo' }
      }
    } catch {
      /* fall through */
    }
  }

  // Cats
  if (/\b(cat|kitten|kitty|neko|feline)\b/.test(k)) {
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search?mime_types=jpg,png', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      })
      const data = await res.json()
      const photoUrl = data?.[0]?.url
      if (photoUrl) {
        const imageUrl = await downloadImageAsDataUrl(photoUrl)
        return { imageUrl, via: 'stock', model: 'thecatapi' }
      }
    } catch {
      /* fall through */
    }
  }

  // Fox
  if (/\bfox\b/.test(k)) {
    try {
      const res = await fetch('https://randomfox.ca/floof/', {
        signal: AbortSignal.timeout(12_000),
      })
      const data = await res.json()
      if (data?.image) {
        const imageUrl = await downloadImageAsDataUrl(data.image)
        return { imageUrl, via: 'stock', model: 'randomfox' }
      }
    } catch {
      /* fall through */
    }
  }

  // Duck
  if (/\b(duck|duckling)\b/.test(k)) {
    try {
      const res = await fetch('https://random-d.uk/api/v2/random', {
        signal: AbortSignal.timeout(12_000),
      })
      const data = await res.json()
      if (data?.url && !/\.gif$/i.test(data.url)) {
        const imageUrl = await downloadImageAsDataUrl(data.url)
        return { imageUrl, via: 'stock', model: 'random-d.uk' }
      }
    } catch {
      /* fall through */
    }
  }

  return null
}

async function fetchWikimediaImage(keyword) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: keyword,
    gsrnamespace: '6', // File namespace
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '800',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`wiki ${res.status}`)
  const data = await res.json()
  const pages = data?.query?.pages || {}
  const files = Object.values(pages)
  // Prefer jpeg/png photos
  for (const page of files) {
    const info = page?.imageinfo?.[0]
    if (!info) continue
    const mime = info.mime || ''
    if (!mime.startsWith('image/') || mime.includes('svg')) continue
    const url = info.thumburl || info.url
    if (!url) continue
    try {
      const imageUrl = await downloadImageAsDataUrl(url)
      return { imageUrl, via: 'stock', model: `wikimedia/${keyword}` }
    } catch {
      continue
    }
  }
  throw new Error('no suitable wikimedia image')
}

function looksLikeQuotaError(status, msg) {
  const m = String(msg || '').toLowerCase()
  return (
    status === 402 ||
    status === 429 ||
    m.includes('quota') ||
    m.includes('depleted') ||
    m.includes('rate limit') ||
    m.includes('resource_exhausted') ||
    m.includes('billing') ||
    m.includes('credits')
  )
}

// ─── Gemini ───────────────────────────────────────────────

export async function generateWithGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')

  const models = [
    process.env.GEMINI_IMAGE_MODEL,
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3.1-flash-image-preview',
  ].filter(Boolean)

  let lastErr = 'no model tried'
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data?.error?.message || JSON.stringify(data).slice(0, 200)
      lastErr = `Gemini ${model} ${res.status}: ${msg}`
      if (looksLikeQuotaError(res.status, msg)) {
        markDepleted('gemini', msg.slice(0, 160), 90)
        throw new Error(lastErr)
      }
      continue
    }
    const parts = data?.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      const inline = part.inlineData || part.inline_data
      if (inline?.data) {
        const mime = inline.mimeType || inline.mime_type || 'image/png'
        return { imageUrl: `data:${mime};base64,${inline.data}`, via: 'gemini', model }
      }
    }
    lastErr = `Gemini ${model}: no image in response`
  }
  throw new Error(lastErr)
}

// ─── Hugging Face ─────────────────────────────────────────

export async function generateWithHuggingFace(prompt) {
  const key = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY
  if (!key) throw new Error('HF_TOKEN not set')

  const errors = []
  // Prefer quality: flux/dev first, then schnell, then together, then replicate
  try {
    return await generateWithHfFal(prompt, key, 'dev')
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
    if (looksLikeQuotaError(0, errors[errors.length - 1])) {
      markDepleted('huggingface', errors[errors.length - 1], 120)
      throw e
    }
  }
  try {
    return await generateWithHfFal(prompt, key, 'schnell')
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
    if (looksLikeQuotaError(0, errors[errors.length - 1])) {
      markDepleted('huggingface', errors[errors.length - 1], 120)
      throw e
    }
  }
  try {
    return await generateWithHfTogether(prompt, key)
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
    if (looksLikeQuotaError(0, errors[errors.length - 1])) {
      markDepleted('huggingface', errors[errors.length - 1], 120)
      throw e
    }
  }
  throw new Error(`HuggingFace failed: ${errors.join(' | ')}`)
}

async function fetchRemoteToDataUrl(imageUrl) {
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download image (${imgRes.status})`)
  const buf = Buffer.from(await imgRes.arrayBuffer())
  if (buf.length < 500) throw new Error('Downloaded image too small')
  const ct = imgRes.headers.get('content-type') || 'image/jpeg'
  const mime = ct.startsWith('image/') ? ct.split(';')[0] : 'image/jpeg'
  return bufferToDataUrl(buf, mime)
}

async function generateWithHfFal(prompt, key, variant = 'dev') {
  const path =
    variant === 'dev' ? 'fal-ai/fal-ai/flux/dev' : 'fal-ai/fal-ai/flux/schnell'
  const model = variant === 'dev' ? 'fal-ai/flux/dev' : 'fal-ai/flux/schnell'

  const res = await fetch(`https://router.huggingface.co/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'square_hd', // 1024-class quality
      num_images: 1,
      enable_safety_checker: true,
      ...(variant === 'dev' ? { num_inference_steps: 28, guidance_scale: 3.5 } : {}),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || data?.detail || JSON.stringify(data).slice(0, 200)
    if (looksLikeQuotaError(res.status, msg)) {
      markDepleted('huggingface', String(msg).slice(0, 160), 120)
    }
    throw new Error(`fal ${variant} ${res.status}: ${msg}`)
  }
  const remoteUrl = data?.images?.[0]?.url || data?.image?.url
  if (!remoteUrl) throw new Error('fal returned no image url')
  const imageUrl = await fetchRemoteToDataUrl(remoteUrl)
  return { imageUrl, via: 'huggingface', model }
}

async function generateWithHfTogether(prompt, key) {
  const model = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-dev'
  const res = await fetch('https://router.huggingface.co/together/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      response_format: 'b64_json',
      width: 1024,
      height: 1024,
      n: 1,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || JSON.stringify(data).slice(0, 200)
    if (looksLikeQuotaError(res.status, msg)) {
      markDepleted('huggingface', String(msg).slice(0, 160), 120)
    }
    throw new Error(`together ${res.status}: ${msg}`)
  }
  const b64 = data?.data?.[0]?.b64_json
  if (b64) {
    return { imageUrl: `data:image/png;base64,${b64}`, via: 'huggingface', model: `together/${model}` }
  }
  const url = data?.data?.[0]?.url
  if (url) {
    return {
      imageUrl: await fetchRemoteToDataUrl(url),
      via: 'huggingface',
      model: `together/${model}`,
    }
  }
  throw new Error('together returned no image')
}

// ─── xAI ──────────────────────────────────────────────────

export async function generateWithXai(prompt) {
  const key = process.env.XAI_API_KEY
  if (!key) throw new Error('XAI_API_KEY not set')

  const model = process.env.XAI_IMAGE_MODEL || 'grok-imagine-image-quality'
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      response_format: 'b64_json',
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data).slice(0, 200)
    if (looksLikeQuotaError(res.status, msg)) markDepleted('xai', msg.slice(0, 160), 60)
    throw new Error(`xAI ${res.status}: ${msg}`)
  }

  const item = data?.data?.[0]
  if (item?.b64_json) {
    return { imageUrl: `data:image/png;base64,${item.b64_json}`, via: 'xai', model }
  }
  if (item?.url) {
    return { imageUrl: await fetchRemoteToDataUrl(item.url), via: 'xai', model }
  }
  throw new Error('xAI returned no image')
}

// ─── Pollinations (free FLUX, high res) ───────────────────

export async function generateWithPollinations(prompt) {
  const seed = Date.now()
  // Try high-quality variants first
  const urls = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=true`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed + 1}&nologo=true&model=flux`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed + 2}&nologo=true`,
  ]

  let lastErr = 'pollinations failed'
  for (const url of urls) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 50_000)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'image/*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      clearTimeout(timer)
      const ct = res.headers.get('content-type') || ''
      const buf = Buffer.from(await res.arrayBuffer())

      if (!res.ok || !ct.startsWith('image/')) {
        lastErr = `pollinations ${res.status}: ${buf.toString('utf8').slice(0, 120)}`
        if (looksLikeQuotaError(res.status, lastErr)) {
          // short cool-down only
          markDepleted('pollinations', lastErr, 5)
        }
        continue
      }
      const isJpeg = buf[0] === 0xff && buf[1] === 0xd8
      const isPng = buf[0] === 0x89 && buf[1] === 0x50
      if (buf.length < 3000 || (!isJpeg && !isPng)) {
        lastErr = 'pollinations returned invalid image'
        continue
      }
      const mime = isPng ? 'image/png' : 'image/jpeg'
      return {
        imageUrl: await bufferToDataUrl(buf, mime),
        via: 'pollinations',
        model: 'pollinations-flux-1024',
      }
    } catch (err) {
      clearTimeout(timer)
      lastErr = err instanceof Error ? err.message : String(err)
    }
  }
  throw new Error(lastErr)
}

// ─── Orchestrator ─────────────────────────────────────────

export async function generateImage(idea, body = {}) {
  const prompt = resolvePrompt(idea, body)
  const preferred = (body.provider || process.env.IMAGE_PROVIDER || '').toLowerCase() || null
  // If preferred is depleted, ignore it
  const prefer =
    preferred && !isDepleted(preferred) ? preferred : null

  // Default: prioritize keys with remaining limit (HF → Gemini → xAI → Pollinations)
  // User asked to prefer keys that still have quota — depleted ones are auto-skipped
  const tryOrder = chooseProviderOrder(prefer)

  const runners = {
    stock: () => generateWithStock(idea),
    gemini: generateWithGemini,
    huggingface: generateWithHuggingFace,
    xai: generateWithXai,
    pollinations: generateWithPollinations,
  }

  const errors = []
  for (const id of tryOrder) {
    const run = runners[id]
    if (!run) continue
    if (isDepleted(id)) {
      errors.push(`${id}: skipped (depleted)`)
      continue
    }
    try {
      console.log(`[image] trying ${id}…`)
      const result = await run(prompt)
      return {
        success: true,
        imageUrl: result.imageUrl,
        idea,
        prompt,
        via: result.via,
        model: result.model,
        style: pickStyle(body),
        message: 'Image generated successfully!',
        tried: tryOrder,
        warnings: errors.length ? errors : undefined,
        providers: listProviders(),
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${id}: ${msg}`)
      console.error(`[image] ${id} failed:`, msg)
    }
  }

  const err = new Error(
    `All providers failed or out of quota. ${errors.join(' | ')}. ` +
      `Add credits to HF (huggingface.co/settings/billing) or wait for Gemini quota reset.`,
  )
  err.details = errors
  throw err
}
