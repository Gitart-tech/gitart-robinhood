export function buildRealisticPrompt(idea: string): string
export function buildMascotPrompt(idea: string): string
export function resolvePrompt(idea: string, body?: Record<string, unknown>): string
export function listProviders(): Record<
  string,
  { available: boolean; free: boolean; quality: string; name: string }
>
export function chooseProvider(preferred: string | null): string
export function generateWithGemini(prompt: string): Promise<{
  imageUrl: string
  via: string
  model: string
}>
export function generateWithHuggingFace(prompt: string): Promise<{
  imageUrl: string
  via: string
  model: string
}>
export function generateWithXai(prompt: string): Promise<{
  imageUrl: string
  via: string
  model: string
}>
export function generateWithPollinations(prompt: string): Promise<{
  imageUrl: string
  via: string
  model: string
}>
export function generateImage(
  idea: string,
  body?: Record<string, unknown>,
): Promise<{
  success: boolean
  imageUrl: string
  idea: string
  prompt: string
  via: string
  model: string
  style: string
  message: string
}>
