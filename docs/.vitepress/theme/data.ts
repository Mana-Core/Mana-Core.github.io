import raw from '../data/extensions.json'

export type Rating = 'safe' | 'mixed' | 'nsfw' | 'unknown'

export interface Source {
  id: string
  name: string
  version?: string
  website?: string
  rating: Rating
  icon?: string
  badges: string[]
  languages: string[]
  developers: { name: string; github?: string; avatar?: string }[]
  path: string
}

export interface Repo {
  slug: string
  repo: string
  owner: string
  name: string
  description: string
  category: string
  branch: string
  thumbnail: string
  author: { name: string; url?: string }
  license?: string
  stars: number
  updatedAt: string
  official: boolean
  url: string
  installUrl: string
  sources: Source[]
}

export const data = raw as { generatedAt: string; org: string; repos: Repo[] }
export const repos = data.repos

// Mana opens a preview card and adds the repository only after the user accepts it.
export function addRepoLink(repo: Repo) {
  return `mana://add-repo?url=${encodeURIComponent(repo.installUrl)}&name=${encodeURIComponent(repo.name)}`
}

// Mana shows the source and asks before installing it.
export function installLink(source: Source, repo: Repo) {
  return `mana://install-source?repo=${encodeURIComponent(repo.installUrl)}&id=${encodeURIComponent(source.id)}`
}

export const ratingLabel: Record<Rating, string> = {
  safe: 'Safe',
  mixed: 'Mixed',
  nsfw: 'NSFW',
  unknown: 'Unrated'
}

const languageNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['en'], { type: 'language' })
  : null

export function languageLabel(code: string) {
  const tag = code.replace('_', '-')
  try {
    return languageNames?.of(tag) ?? tag
  } catch {
    return tag
  }
}

// Drops the region ("American English" → "English") so card tags stay one line.
export function languageShort(code: string) {
  return languageLabel(code.split(/[-_]/)[0])
}

// One tag per language, regional variants merged, in the source's own order.
export function uniqueLanguages(codes: string[]) {
  const seen = new Map<string, string[]>()
  for (const code of codes) {
    const short = languageShort(code)
    seen.set(short, [...(seen.get(short) ?? []), languageLabel(code)])
  }
  return [...seen].map(([short, full]) => ({ short, full: full.join(', ') }))
}

// Fixed locale and zone so the prerendered HTML matches hydration.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function count<T>(items: T[], key: (item: T) => string | string[]) {
  const map = new Map<string, number>()
  for (const item of items) {
    for (const k of [key(item)].flat()) map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}
