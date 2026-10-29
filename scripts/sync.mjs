// Builds docs/.vitepress/data/extensions.json from the repos in registry.json
// plus every repo in the org tagged with the registry topic.
//
// Source metadata is read statically from each repo's TypeScript (the
// `info: SourceInfo = {...}` object), so nothing from the extension repos is
// executed. Set GITHUB_TOKEN to avoid the 60 req/h anonymous API limit.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = resolve(root, 'docs/.vitepress/data/extensions.json')
const registry = JSON.parse(await readFile(resolve(root, 'registry.json'), 'utf8'))

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'mana-core-docs',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
}

async function gh(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`)
  return res.json()
}

async function raw(repo, branch, path) {
  const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`)
  return res.ok ? res.text() : null
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx], idx)
    }
  }))
  return out
}

// --- SourceInfo parsing -----------------------------------------------------

// Resolves `const NAME = 'value'` declarations so `website: DOMAIN` works, and
// `const MIRRORS = ['a', 'b']` so `website: MIRRORS[0]` does too.
function constants(code) {
  const map = {}
  for (const m of code.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::\s*\w+)?\s*=\s*(['"`])([^'"`]*)\2/g)) {
    map[m[1]] = m[3]
  }
  for (const m of code.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w[\]]+)?\s*=\s*\[([^\]]*)\]/g)) {
    map[m[1]] = [...m[2].matchAll(/(['"`])(.*?)\1/g)].map(x => x[2])
  }
  return map
}

// Grabs the balanced `{...}` that follows `info: SourceInfo =`, `SOURCE_INFO: SourceInfo =`
// or a class field `readonly info = `.
function infoBlock(code) {
  const m = /(?::\s*SourceInfo|\breadonly\s+info(?:\s*:\s*\w+)?)\s*=\s*\{/.exec(code)
  if (!m) return null
  let depth = 0
  for (let i = m.index + m[0].length - 1; i < code.length; i++) {
    if (code[i] === '{') depth++
    else if (code[i] === '}' && --depth === 0) return code.slice(m.index + m[0].length - 1, i + 1)
  }
  return null
}

function value(block, key, consts) {
  const m = new RegExp(`\\b${key}\\s*:\\s*(\`[^\`]*\`|[^,\\n}]+)`).exec(block)
  if (!m) return undefined
  return expression(m[1].trim(), consts)
}

function expression(raw, consts) {
  const v = raw.replace(/\s+as\s+[\w[\]]+$/, '')
  // `MIRRORS[0] ?? 'https://…'` takes the first side that resolves.
  const [first, ...rest] = v.split(/\s*\?\?\s*/)
  if (rest.length) return expression(first, consts) ?? expression(rest.join(' ?? '), consts)
  // Checked before plain strings, which would otherwise swallow backtick templates.
  const tpl = /^`(.*)`$/.exec(v)
  if (tpl) return tpl[1].replace(/\$\{(\w+)\}/g, (_, k) => (typeof consts[k] === 'string' ? consts[k] : ''))
  const str = /^(['"])(.*)\1$/.exec(v)
  if (str) return str[2]
  const ver = /getExportVersion\(\s*(['"`])(.*?)\1\s*\)/.exec(v)
  if (ver) return ver[2]
  const idx = /^(\w+)\[(\d+)\]$/.exec(v)
  if (idx) return Array.isArray(consts[idx[1]]) ? consts[idx[1]][Number(idx[2])] : undefined
  if (typeof consts[v] === 'string') return consts[v]
  const en = /\.(\w+)$/.exec(v)
  if (en) return en[1]
  return v
}

function list(block, key) {
  const m = new RegExp(`\\b${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`).exec(block)
  if (!m) return []
  return [...m[1].matchAll(/(['"`])(.*?)\1/g)].map(x => x[2])
}

function developers(block) {
  const m = /\bdevelopers\s*:\s*\[([\s\S]*?)\]\s*,?/.exec(block)
  if (!m) return []
  return [...m[1].matchAll(/\{([\s\S]*?)\}/g)].map(d => ({
    name: /name\s*:\s*(['"`])(.*?)\1/.exec(d[1])?.[2],
    github: /github\s*:\s*(['"`])(.*?)\1/.exec(d[1])?.[2],
    avatar: /avatarUrl\s*:\s*(['"`])(.*?)\1/.exec(d[1])?.[2]
  })).filter(d => d.name)
}

const RATINGS = { SAFE: 'safe', MIXED: 'mixed', EXPLICIT: 'nsfw', NSFW: 'nsfw' }

async function readSource(repo, branch, dir, files, assets) {
  const candidates = files
    .filter(f => f.startsWith(`${dir}/`) && f.endsWith('.ts') && !f.includes('/tests/') && !f.endsWith('.test.ts'))
    .sort((a, b) => Number(b.endsWith('/index.ts')) - Number(a.endsWith('/index.ts')) || Number(/Info\.ts$/.test(b)) - Number(/Info\.ts$/.test(a)))

  // Read every file in the folder so constants defined next to the info object resolve.
  let block = null
  let consts = {}
  for (const file of candidates.slice(0, 12)) {
    const code = await raw(repo, branch, file)
    if (!code) continue
    consts = { ...consts, ...constants(code) }
    block ??= infoBlock(code)
  }
  const folder = dir.split('/').pop()
  if (!block) return { id: folder, name: folder, rating: 'unknown', path: dir }

  const thumbnail = value(block, 'thumbnail', consts)
  const asset = thumbnail && assets.find(a => a.endsWith(`/${thumbnail}`))
  const rating = value(block, 'rating', consts)
  return {
    id: value(block, 'id', consts) ?? folder,
    name: value(block, 'name', consts) ?? folder,
    version: value(block, 'version', consts),
    website: value(block, 'website', consts),
    rating: RATINGS[rating] ?? 'unknown',
    icon: asset ? `https://raw.githubusercontent.com/${repo}/${branch}/${asset}` : (thumbnail?.startsWith('http') ? thumbnail : undefined),
    badges: list(block, 'badges'),
    languages: list(block, 'supportedLanguages'),
    developers: developers(block),
    path: dir
  }
}

// --- Repos ------------------------------------------------------------------

async function readRepo(entry) {
  const meta = await gh(`repos/${entry.repo}`)
  const branch = entry.branch ?? meta.default_branch
  const tree = await gh(`repos/${entry.repo}/git/trees/${branch}?recursive=1`)
  const files = tree.tree.filter(t => t.type === 'blob').map(t => t.path)
  const sourcesDir = entry.sourcesDir ?? 'src/sources'
  const exclude = new Set(entry.exclude ?? [])
  const assets = files.filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f))
  // One source per folder directly under sourcesDir.
  const dirs = [...new Set(files
    .map(f => f.startsWith(`${sourcesDir}/`) && f.slice(sourcesDir.length + 1).split('/'))
    .filter(parts => parts && parts.length > 1 && !exclude.has(parts[0]))
    .map(parts => `${sourcesDir}/${parts[0]}`))]

  const pkg = JSON.parse((await raw(entry.repo, branch, 'package.json')) ?? '{}')
  const sources = (await mapLimit(dirs, 8, d => readSource(entry.repo, branch, d, files, assets)))
    .sort((a, b) => a.name.localeCompare(b.name))

  const author = typeof pkg.author === 'string' ? { name: pkg.author } : pkg.author
  const [owner, name] = entry.repo.split('/')
  console.log(`  ${entry.repo}@${branch}: ${sources.length} sources`)
  return {
    slug: entry.slug ?? name.replace(/^extensions?-/, ''),
    repo: entry.repo,
    owner,
    name: entry.name ?? pkg.mana?.repositoryName ?? pkg.repositoryName ?? name,
    description: entry.description ?? meta.description ?? pkg.description ?? '',
    category: entry.category ?? 'Misc',
    branch,
    thumbnail: pkg.mana?.thumbnail ?? meta.owner.avatar_url,
    author: author ? { name: author.name, url: author.url } : { name: owner, url: `https://github.com/${owner}` },
    license: meta.license?.spdx_id ?? pkg.license,
    stars: meta.stargazers_count,
    updatedAt: meta.pushed_at,
    official: owner.toLowerCase() === registry.org.toLowerCase(),
    url: meta.html_url,
    installUrl: entry.installUrl ?? `https://${owner.toLowerCase()}.github.io/${name}/${branch}`,
    sources
  }
}

async function discovered() {
  try {
    const repos = await gh(`orgs/${registry.org}/repos?per_page=100`)
    return repos
      .filter(r => !r.archived && r.topics?.includes(registry.topic))
      .map(r => ({ repo: r.full_name }))
  } catch (e) {
    console.warn(`  org discovery skipped: ${e.message}`)
    return []
  }
}

// Only org repos with the topic are listed; registry entries just override their settings.
const overrides = new Map(registry.repos.map(e => [e.repo.toLowerCase(), e]))
for (const e of registry.repos) {
  if (!e.repo.toLowerCase().startsWith(`${registry.org.toLowerCase()}/`)) {
    console.warn(`  ignoring ${e.repo}: only ${registry.org} repos are listed`)
  }
}
const entries = (await discovered()).map(d => ({ ...d, ...overrides.get(d.repo.toLowerCase()) }))

console.log(`Syncing ${entries.length} repo(s)`)
const repos = []
for (const entry of entries) {
  try {
    repos.push(await readRepo(entry))
  } catch (e) {
    console.warn(`  ${entry.repo}: ${e.message}`)
  }
}

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), org: registry.org, repos }, null, 2) + '\n')
console.log(`Wrote ${outFile}`)
