# Optional AI image API setup

Gitart works **without** AI keys. Logo commands use **on-demand stock photos** by default.

Set `USE_AI_IMAGE=1` and at least one key below if you want AI-generated images.

## Providers

| # | Provider | Env var | Free tier | Quality |
|---|----------|---------|-----------|---------|
| 1 | Google Gemini Flash Image | `GEMINI_API_KEY` | AI Studio | High |
| 2 | Hugging Face FLUX | `HF_TOKEN` | Monthly credits | High |
| 3 | xAI Grok Imagine | `XAI_API_KEY` | Paid | Very high |
| 4 | Pollinations | *(none)* | Yes, rate-limited | Medium |

Recommended free start: **Gemini**.

## 1) Google Gemini

1. Open [Google AI Studio → API keys](https://aistudio.google.com/app/apikey)
2. Sign in → **Create API key**
3. Copy the key into `.env`:

```env
USE_AI_IMAGE=1
GEMINI_API_KEY=your_key_here
# GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

4. Restart `npm run dev`

## 2) Hugging Face

1. Create an account: [huggingface.co/join](https://huggingface.co/join)
2. Token: [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Enable Inference permissions

```env
USE_AI_IMAGE=1
HF_TOKEN=hf_...
# HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

## 3) xAI Grok Imagine

1. [console.x.ai](https://console.x.ai) — add credits
2. Create an API key

```env
USE_AI_IMAGE=1
XAI_API_KEY=xai-...
```

## Force a provider

```env
IMAGE_PROVIDER=gemini
# huggingface | xai | pollinations | stock
```

## Check providers

```text
GET /api/providers
```

## Security

- Keep keys in `.env` or Vercel Environment Variables only
- Never commit `.env`
- Never expose keys in frontend code

## Troubleshooting

| Error | Fix |
|-------|-----|
| `429` / quota | Wait for reset or use another provider |
| HF model loading | Wait ~20s and retry |
| All providers failed | Check `/api/providers` and keys |
| Emoji fallback | Stock/AI fetch failed — check network |
