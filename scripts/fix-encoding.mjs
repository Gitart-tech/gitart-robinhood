import fs from 'fs'
import path from 'path'

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx|ts|css|md)$/.test(p)) out.push(p)
  }
  return out
}

const files = walk('src')
let n = 0
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8')
  const orig = c
  c = c
    .replace(/\u00c3\u00a2\u00e2\u20ac\u0161\u00c3\u00a2\u00e2\u20ac\u017e\u00c3\u00a2\u00e2\u20ac\u009d/g, '-')
    .replace(/Ã¢â‚¬â€/g, '-')
    .replace(/Ã¢â‚¬â€œ/g, '-')
    .replace(/Ã¢â‚¬â€/g, '-')
    .replace(/Ã¢Å“â€œ/g, '[OK]')
    .replace(/â€¦/g, '...')
    .replace(/â€”/g, '-')
    .replace(/â€“/g, '-')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    // unicode checkmark/emoji that got corrupted -> ascii
    .replace(/\u2713/g, '[OK]')
    .replace(/\u2714/g, '[OK]')
  if (c !== orig) {
    fs.writeFileSync(file, c, 'utf8')
    n++
    console.log('fixed', file)
  }
}
console.log('files fixed:', n)
