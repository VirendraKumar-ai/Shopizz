import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

function scanDir(dir: string) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  for (const f of files) {
    const full = path.join(dir, f.name)
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.nuxt' && f.name !== '.output') {
      scanDir(full)
    } else if (f.isFile() && f.name.endsWith('.vue')) {
      const content = fs.readFileSync(full, 'utf-8')
      // Check for matching script/template/style tags
      const scriptOpen = (content.match(/<script/g) || []).length
      const scriptClose = (content.match(/<\/script>/g) || []).length
      const templateOpen = (content.match(/<template/g) || []).length
      const templateClose = (content.match(/<\/template>/g) || []).length
      const styleOpen = (content.match(/<style/g) || []).length
      const styleClose = (content.match(/<\/style>/g) || []).length

      if (scriptOpen !== scriptClose || templateOpen !== templateClose || styleOpen !== styleClose) {
        console.error(`TAG MISMATCH in ${full}:`, { scriptOpen, scriptClose, templateOpen, templateClose, styleOpen, styleClose })
      }
    }
  }
}

scanDir('./app')
console.log('Vue SFC tag structure validation complete!')
process.exit(0)
