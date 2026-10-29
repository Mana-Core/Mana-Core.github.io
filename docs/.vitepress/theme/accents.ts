// Accent palettes for the settings panel. `1` is the main accent, `2` hover /
// light-mode text, `3` the deep shade used for backgrounds and borders.
// Hues stay clear of 7°, 22°, 30°, 72°, 185°, 225–247°, 301° and gray so the
// palette stays distinct from similar sites.
export interface Accent {
  id: string
  name: string
  colors: [string, string, string]
}

export const accents: Accent[] = [
  { id: 'mana', name: 'Mana', colors: ['oklch(0.74 0.15 280)', 'oklch(0.62 0.18 280)', 'oklch(0.40 0.12 280)'] },
  { id: 'orchid', name: 'Orchid', colors: ['oklch(0.76 0.16 330)', 'oklch(0.64 0.19 330)', 'oklch(0.42 0.13 330)'] },
  { id: 'ember', name: 'Ember', colors: ['oklch(0.78 0.15 52)', 'oklch(0.68 0.18 48)', 'oklch(0.45 0.12 45)'] },
  { id: 'volt', name: 'Volt', colors: ['oklch(0.87 0.17 115)', 'oklch(0.74 0.17 118)', 'oklch(0.46 0.11 120)'] },
  { id: 'verdant', name: 'Verdant', colors: ['oklch(0.80 0.15 152)', 'oklch(0.67 0.15 152)', 'oklch(0.42 0.09 152)'] }
]

export const defaultAccent = 'mana'
