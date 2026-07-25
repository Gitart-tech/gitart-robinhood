import { chromium } from 'playwright-core'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '..', 'assets', 'screenshots')
fs.mkdirSync(out, { recursive: true })

const edge =
  process.env.EDGE_PATH ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await chromium.launch({
  executablePath: edge,
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('https://gitart.xyz/', { waitUntil: 'networkidle', timeout: 60000 })
// dismiss splash
await page.waitForTimeout(3200)
await page.mouse.click(700, 450)
await page.waitForTimeout(900)

await page.screenshot({ path: path.join(out, '01-hero.png') })

await page.evaluate(() =>
  document.querySelector('#demo')?.scrollIntoView({ behavior: 'instant', block: 'center' }),
)
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(out, '02-terminal-demo.png') })

await page.evaluate(() =>
  document.querySelector('#features')?.scrollIntoView({ behavior: 'instant', block: 'start' }),
)
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(out, '03-features.png') })

await page.evaluate(() =>
  document.querySelector('#commands')?.scrollIntoView({ behavior: 'instant', block: 'start' }),
)
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(out, '04-commands.png') })

await page.evaluate(() =>
  document.querySelector('#contract')?.scrollIntoView({ behavior: 'instant', block: 'center' }),
)
await page.waitForTimeout(2800)
await page.screenshot({ path: path.join(out, '05-contract.png') })

await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(out, '00-full-preview.png'), fullPage: true })

await browser.close()
console.log('screenshots done')
for (const f of fs.readdirSync(out)) {
  console.log(f, fs.statSync(path.join(out, f)).size)
}
