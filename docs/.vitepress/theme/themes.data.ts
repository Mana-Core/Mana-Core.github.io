import { readFileSync } from 'node:fs'
import { defineLoader } from 'vitepress'

export interface ManaTheme {
  id: string
  name: string
  url: string
  colors: Record<string, string>
}

const PREVIEWED = [
  'accent', 'background', 'contentTileOverlay', 'foregroundOnAccent', 'label', 'secondaryBackground',
  'secondaryLabel', 'separator', 'statusDestructive', 'statusInfo', 'tertiaryBackground'
]

declare const data: ManaTheme[]
export { data }

export default defineLoader({
  watch: ['../data/themes.json'],
  load([file]): ManaTheme[] {
    const themes: ManaTheme[] = JSON.parse(readFileSync(file, 'utf8'))
    for (const theme of themes) {
      const missing = PREVIEWED.filter(key => !theme.colors?.[key])
      if (!theme.id || !theme.name || missing.length) {
        throw new Error(`${theme.url}: needs an id, a name and ${missing.join(', ') || 'its colors'}`)
      }
    }

    // A theme's id is its identity in Mana, so a copied file must not ship with the original's.
    const ids = new Set(themes.map(t => t.id))
    if (ids.size !== themes.length) throw new Error('Two themes in the themes repo share an id')

    return themes.sort((a, b) => a.name.localeCompare(b.name))
  }
})
