# Hướng dẫn lấy API free để tạo ảnh chân thật

Project hỗ trợ **4 nguồn** (tự chọn theo key có sẵn):

| # | Provider | Key env | Free? | Chất lượng | Link lấy key |
|---|----------|---------|-------|------------|--------------|
| 1 | **Google Gemini Flash Image** | `GEMINI_API_KEY` | Có (AI Studio) | Cao, realistic tốt | [aistudio.google.com/apikey](https://aistudio.google.com/app/apikey) |
| 2 | **Hugging Face FLUX** | `HF_TOKEN` | Có (credit tháng) | Cao | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| 3 | **xAI Grok Imagine** | `XAI_API_KEY` | Trả phí | Rất cao | [console.x.ai](https://console.x.ai) |
| 4 | **Pollinations** | *(không cần)* | Có | TB, hay bị limit | — |

Khuyến nghị: lấy **Gemini** trước (nhanh, free, ảnh đẹp).

---

## 1) Google Gemini (khuyên dùng)

1. Mở [Google AI Studio → API keys](https://aistudio.google.com/app/apikey)
2. Đăng nhập Google → **Create API key**
3. Copy key (dạng `AIza...`)
4. Dán vào file `.env` ở root project:

```env
GEMINI_API_KEY=AIzaSy.....your_key
```

5. Restart `npm run dev`
6. Trong terminal website:

```text
gitart create logo "a golden retriever dog in a park"
```

Model mặc định: `gemini-2.5-flash-image`  
Đổi model (nếu Google đổi tên):

```env
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

> Free tier có thể bị quota theo ngày. Nếu lỗi 429 → đợi hoặc dùng HF.

---

## 2) Hugging Face (FLUX free credits)

1. Tạo account: [huggingface.co/join](https://huggingface.co/join)
2. Token: [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. **Create new token** → bật quyền **Inference** / “Make calls to Inference Providers”
4. Copy token (`hf_...`)

```env
HF_TOKEN=hf_................
# optional:
# HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

Model mặc định `FLUX.1-schnell` — nhanh, realistic tốt.

Lần đầu model có thể “cold start” 20–60s; retry nếu báo loading.

---

## 3) xAI Grok Imagine (chất lượng cao, có phí)

1. [accounts.x.ai](https://accounts.x.ai) → nạp credit
2. Tạo key: [console.x.ai](https://console.x.ai)
3. Docs: [docs.x.ai](https://docs.x.ai)

```env
XAI_API_KEY=xai-................
# XAI_IMAGE_MODEL=grok-imagine-image-quality
```

---

## 4) Cấu hình project

```bash
cd C:\Users\ACER\gitart-robinhood-clone
copy .env.example .env
# Mở .env, dán ít nhất 1 key
npm run dev
```

### Ép dùng 1 provider

```env
IMAGE_PROVIDER=gemini
# hoặc: huggingface | xai | pollinations
```

### Kiểm tra key đã load

Mở: http://127.0.0.1:5173/api/providers  

```json
{
  "providers": {
    "gemini": { "available": true, ... },
    "huggingface": { "available": false, ... },
    ...
  }
}
```

---

## Lệnh trong terminal web

| Lệnh | Ý nghĩa |
|------|---------|
| `gitart create logo "dog"` | Tạo ảnh (mặc định **realistic**) |
| `gitart create logo "dog" --mascot` | Style cartoon mascot |
| `gitart create logo "dog" --realistic` | Ảnh chân thật |

---

## Bảo mật

- Key **chỉ** nằm trong `.env` / Vercel Environment Variables
- **Không** commit `.env` (đã có trong `.gitignore`)
- **Không** put key vào frontend React

### Deploy Vercel

Project Settings → Environment Variables thêm:

- `GEMINI_API_KEY` (hoặc `HF_TOKEN` / `XAI_API_KEY`)

---

## Troubleshooting

| Lỗi | Cách xử lý |
|-----|------------|
| `Gemini 429` | Hết quota free → đợi hoặc dùng HF |
| `HF model is currently loading` | Đợi 20s, chạy lại lệnh |
| `All providers failed` | Check `/api/providers`, key sai/hết hạn |
| Vẫn emoji mascot | API fail → xem log terminal `npm run dev` |
| Key không nhận | Restart dev server sau khi sửa `.env` |
