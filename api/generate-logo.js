import {
  generateImage,
  listProviders,
} from '../server/imageProviders.mjs'

/**
 * Vercel serverless: POST /api/generate-logo
 * Keys from Vercel env: GEMINI_API_KEY, HF_TOKEN, XAI_API_KEY
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    return res.status(200).json({ providers: listProviders() })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const idea = String((req.body && (req.body.idea || req.body.prompt)) || 'Logo').slice(0, 100)
    const result = await generateImage(idea, req.body || {})
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to generate image',
    })
  }
}
