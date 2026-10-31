import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { defineLoader } from 'vitepress'

export interface ManaTheme {
  slug: string
  id: string
  name: string
  colors: Record<string, string>
}

const PREVIEWED = [
  'accent', 'background', 'contentTileOverlay', 'foregroundOnAccent', 'label', 'secondaryBackground',
  'secondaryLabel', 'separator', 'statusDestructive', 'statusInfo', 'tertiaryBackground'
]

declare const data: ManaTheme[]
export { data }

export default defineLoader({
  watch: ['../../public/themes/*.json'],
  load(files): ManaTheme[] {
    const themes = files.map((file) => {
      const { theme } = JSON.parse(readFileSync(file, 'utf8'))
      const colors = theme?.colors?.values ?? {}
      const missing = PREVIEWED.filter(key => !colors[key])
      if (!theme?.id || !theme.name || missing.length) {
        throw new Error(`${basename(file)}: needs an id, a name and ${missing.join(', ') || 'its colors'}`)
      }
      return { slug: basename(file, '.json'), id: theme.id, name: theme.name, colors }
    })

    // A theme's id is its identity in Mana, so a copied file must not ship with the original's.
    const ids = new Set(themes.map(t => t.id))
    if (ids.size !== themes.length) throw new Error('Two themes in docs/public/themes share an id')

    return themes.sort((a, b) => a.name.localeCompare(b.name))
  }
})
