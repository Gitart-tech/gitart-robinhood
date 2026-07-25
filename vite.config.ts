import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  generateImage,
  listProviders,
} from './server/imageProviders.mjs'

/**
 * POST /api/generate-logo  { idea, style?, provider? }
 * GET  /api/providers      → which keys are configured
 */
function generateLogoApi(env: Record<string, string>): Plugin {
  // Inject env into process.env for the provider module
  for (const [k, v] of Object.entries(env)) {
    if (v && !process.env[k]) process.env[k] = v
  }

  const postHandler = async (
    req: import('http').IncomingMessage,
    res: import('http').ServerResponse,
  ) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ providers: listProviders() }))
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    try {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
      }
      const raw = Buffer.concat(chunks).toString('utf8')
      const body = raw ? JSON.parse(raw) : {}
      const idea = String(body.idea || body.prompt || 'Logo').slice(0, 100)

      const result = await generateImage(idea, body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : 'Failed to generate image',
        }),
      )
    }
  }

  return {
    name: 'generate-logo-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-logo', (req, res) => {
        void postHandler(req, res)
      })
      server.middlewares.use('/api/providers', (_req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ providers: listProviders() }))
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/generate-logo', (req, res) => {
        void postHandler(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), generateLogoApi(env)],
  }
})
