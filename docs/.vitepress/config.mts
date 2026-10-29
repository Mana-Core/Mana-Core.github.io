import { readFileSync } from 'node:fs'
import { defineConfig, type DefaultTheme } from 'vitepress'
import { accents, defaultAccent } from './theme/accents'

const data = JSON.parse(readFileSync(new URL('./data/extensions.json', import.meta.url), 'utf8')) as {
  repos: { slug: string; name: string; sources: unknown[] }[]
}

// GitHub Pages serves project sites from /<repo>/. The deploy workflow sets
// DOCS_BASE; Mana-Core.github.io (an org site) uses the default '/'.
const base = process.env.DOCS_BASE ?? '/'

// Repo pages still exist (for install URLs) but are unlisted; only sources show.
const totalSources = data.repos.reduce((n, r) => n + r.sources.length, 0)

const icon = (name: string, text: string) => `<span class="mc-icon i-${name}"></span>${text}`

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    items: [
      { text: icon('home', 'Home'), link: '/' },
      { text: `${icon('package', 'Source Index')}${totalSources ? ` <span class="mc-count">${totalSources}</span>` : ''}`, link: '/extensions/' }
    ]
  },
  {
    text: icon('book', 'Guides'),
    collapsed: false,
    items: [
      { text: 'Installing extensions', link: '/guide/installing' },
      { text: 'Developing sources', link: 'https://mana-ios.github.io/overview', target: '_blank' }
    ]
  },
  {
    items: [
      { text: icon('help', 'FAQ'), link: '/faq' }
    ]
  }
]

// Applies saved accent/toggles before first paint (mirrors theme/settings.ts).
const prePaint = `(()=>{try{
var a=${JSON.stringify(Object.fromEntries(accents.map(a => [a.id, a.colors])))};
var s=JSON.parse(localStorage.getItem('mana-core:settings')||'{}');
var c=a[s.accent]||a[${JSON.stringify(defaultAccent)}],e=document.documentElement;
c.forEach(function(v,i){e.style.setProperty('--mc-accent-'+(i+1),v)});
if(s.accentBackground)e.classList.add('accent-bg');
if(s.effects===false)e.classList.add('effects-disabled');
if(s.icons===false)e.classList.add('icons-hidden');
if(s.nsfw!==true)e.classList.add('nsfw-hidden');
}catch(_){document.documentElement.classList.add('nsfw-hidden')}})()`

export default defineConfig({
  base,
  lang: 'en-US',
  title: 'Mana Core',
  titleTemplate: ':title • Mana Core',
  description: 'Community-maintained extensions for the Mana app.',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    ['meta', { name: 'theme-color', content: '#100f17' }],
    ['meta', { property: 'og:title', content: 'Mana Core' }],
    ['meta', { property: 'og:description', content: 'Community-maintained extensions for the Mana app.' }],
    ['script', {}, prePaint]
  ],
  transformPageData(page) {
    // Dynamic repo pages take their title from the route params.
    if (page.params?.title) {
      page.title = page.params.title
      page.description = page.params.description
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Mana Core',
    nav: [],
    sidebar,
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Mana-Core' }],
    footer: {
      message: 'Extensions are made and maintained by the community. Mana Core does not host any content.',
      copyright: 'Mana Core'
    },
    docFooter: { prev: 'Previous', next: 'Next' }
  }
})
