import fs from 'fs'

const file = 'src/components/TerminalModal.tsx'
let c = fs.readFileSync(file, 'utf8')

// Replace any string that still has mojibake characters with safe ascii versions
const replacements = [
  [/text: '[^']*Initializing Gitart\.\.\.'/g, "text: '... Initializing Gitart...'"],
  [/text: '[^']*Connecting to RobinHood network\.\.\.'/g, "text: '... Connecting to RobinHood network...'"],
  [/text: '[^']*Validating project configuration\.\.\.'/g, "text: '... Validating project configuration...'"],
  [/text: '[^']*Searching the web[^']*'/g, "text: '... Searching the web for a matching photo...'"],
  [/text: `[ ^`]*Keyword: \$\{idea\}`/g, 'text: `Keyword: "${idea}"`'],
  [/text: '[^']*Fetching on demand[^']*'/g, "text: '... Fetching on demand (not pre-downloaded)...'"],
  [/text: `[ ^`]*Subject: \$\{idea\}`/g, 'text: `Subject: ${idea}`'],
  [/text: `[ ^`]*Source: \$\{result\.via\}/g, 'text: `Source: ${result.via}'],
  [/text: '[^']*Real photo pulled from the internet[^']*'/g, "text: '[OK] Real photo pulled from the internet just now'"],
  [/text: '[^']*Used local fallback[^']*'/g, "text: '[!] Used local fallback (web fetch failed)'"],
  [/text: '[^']*Logo downloaded[^']*'/g, "text: '[OK] Logo downloaded as gitart-logo.png'"],
  [/text: '[^']*No logo yet[^']*'/g, "text: '[!] No logo yet. Run: gitart create logo \"your idea\"'"],
  [/text: '[^']*Logo applied[^']*'/g, "text: '[OK] Logo applied to project Hero section'"],
  [/text: '[^']*Assets updated[^']*'/g, "text: '[OK] Assets updated on RobinHood chain metadata'"],
  [/text: `[ ^`]*Error: \$\{msg\}`/g, 'text: `Error: ${msg}`'],
  [/text: `[ ^`]*\$\{result\.error\}`/g, 'text: `${result.error}`'],
  // leftover mojibake glyphs
  [/Ã.[^\s'"`A-Za-z0-9\[\]]*/g, ''],
  [/Â./g, ''],
]

for (const [re, to] of replacements) {
  c = c.replace(re, to)
}

// Fix common broken template strings from over-replace
c = c.replace(/text: `Keyword: "\$\{idea\}"`/g, 'text: `Keyword: "${idea}"`')

fs.writeFileSync(file, c)

// Report remaining non-ascii in string literals
const lines = c.split('\n')
let bad = 0
lines.forEach((l, i) => {
  if (/[^\x00-\x7F]/.test(l) && /text:|command:|output:/.test(l)) {
    console.log(i + 1, l.trim().slice(0, 120))
    bad++
  }
})
console.log('remaining non-ascii text lines:', bad)
