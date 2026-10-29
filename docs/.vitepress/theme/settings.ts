import { reactive, watch } from 'vue'
import { accents, defaultAccent } from './accents'

export interface Settings {
  accent: string
  accentBackground: boolean
  effects: boolean
  icons: boolean
  nsfw: boolean
}

const KEY = 'mana-core:settings'

const defaults: Settings = {
  accent: defaultAccent,
  accentBackground: false,
  effects: true,
  icons: true,
  nsfw: false
}

function load(): Settings {
  try {
    const s: Settings = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    // Saved accents from an older palette fall back to the default.
    if (!accents.some(a => a.id === s.accent)) s.accent = defaultAccent
    return s
  } catch {
    return { ...defaults }
  }
}

// Mirrors the inline script in config.mts, which runs before first paint.
export function apply(s: Settings) {
  const el = document.documentElement
  const accent = accents.find(a => a.id === s.accent) ?? accents[0]
  accent.colors.forEach((c, i) => el.style.setProperty(`--mc-accent-${i + 1}`, c))
  el.classList.toggle('accent-bg', s.accentBackground)
  el.classList.toggle('effects-disabled', !s.effects)
  el.classList.toggle('icons-hidden', !s.icons)
  el.classList.toggle('nsfw-hidden', !s.nsfw)
}

let state: Settings | null = null

export function useSettings(): Settings {
  if (state) return state
  state = reactive(typeof window === 'undefined' ? { ...defaults } : load())
  if (typeof window !== 'undefined') {
    watch(state, s => {
      try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
      apply(s)
    }, { deep: true, immediate: true })
  }
  return state
}

export function resetSettings() {
  Object.assign(useSettings(), defaults)
}

export function isDefault(s: Settings) {
  return (Object.keys(defaults) as (keyof Settings)[]).every(k => s[k] === defaults[k])
}
