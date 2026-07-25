# Gitart on RobinHood — Clone

Full clone of [gitart-base.vercel.app](https://gitart-base.vercel.app/) with **Base → RobinHood** rebranding.

## What's included

Landing page sections (same structure as the original):

- **Navbar** — logo badge “on RobinHood”, Demo / Features / Commands, Get Started
- **Hero** — typing headline, CTAs, install snippet
- **Terminal demo** — auto-playing CLI simulation (`gitart init`, create, deploy on RobinHood)
- **Interactive terminal modal** — `gitart create "idea"`, `gitart create logo "idea"`, project generation animation
- **How It Works** — Create / Customize / Deploy
- **Why Gitart** — 6 feature cards
- **Core Commands** — full command list including `gitart connect-robinhood`
- **CTA + Footer**

## Base → RobinHood changes

| Original | Clone |
|----------|--------|
| on Base | on RobinHood |
| Built on Base | Built on RobinHood |
| Base wallet / mainnet | RobinHood wallet / mainnet |
| `gitart connect-base` | `gitart connect-robinhood` |
| `deploy --network base` | `deploy --network robinhood` |
| Based Pepe / BasedMeme | RobinHood Pepe / RobinHoodMeme |
| CHAIN: Base | CHAIN: RobinHood |
| Mint on Base | Mint on RobinHood |

## Run

```bash
npm install
copy .env.example .env
# Paste at least one free API key (see below)
npm run dev
```

Open http://localhost:5173

```bash
npm run build
npm run preview
```

## Ảnh logo / preview (stock on-demand)

**Không cần tải sẵn, không cần API key AI.**

Khi chạy lệnh, server lấy **ảnh thật trên mạng** theo từ khóa:

```text
gitart create logo "dog"      →  ảnh chó (dog.ceo)
gitart create logo "cat"      →  ảnh mèo
gitart create logo "mountain" →  LoremFlickr / Wikimedia
```

Ảnh chỉ tải **lúc có lệnh** → trả về browser (base64). Không lưu kho ảnh trong project.

Tuỳ chọn bật AI sau: `USE_AI_IMAGE=1` + key trong `.env` (xem `docs/IMAGE_API_SETUP.md`).

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- JetBrains Mono
- On-demand web stock photos (dog.ceo, LoremFlickr, …)
