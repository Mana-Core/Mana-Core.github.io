<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import SourceIcon from './SourceIcon.vue'
import ManaTitle from './ManaTitle.vue'
import { installLink, ratingLabel, repos } from '../data'

const all = repos.flatMap(repo => repo.sources.map(source => ({ source, repo })))
const totalSources = all.length
const featured = all.map(i => i.source).filter(s => s.icon && (s.rating === 'safe' || s.rating === 'mixed')).slice(0, 18)

const query = ref('')
const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return all.filter(({ source }) => source.name.toLowerCase().includes(q) || source.website?.toLowerCase().includes(q)).slice(0, 6)
})
const host = (url?: string) => url?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') ?? ''

function search() {
  const q = query.value.trim()
  location.href = withBase(`/extensions/${q ? `?q=${encodeURIComponent(q)}` : ''}`)
}

const groups = [
  {
    title: 'Browse',
    links: [
      { icon: 'package', title: 'Source Index', text: 'Every 3rd Party source, with install links', link: '/extensions/' },
      { icon: 'rocket', title: 'Getting Started', text: 'Add a source to Mana in under a minute', link: '/guide/installing' }
    ]
  },
  {
    title: 'Learn',
    links: [
      { icon: 'wrench', title: 'Develop', text: 'Write, build and test your own sources', link: 'https://mana-ios.github.io/overview' },
      { icon: 'help', title: 'FAQ', text: 'Common questions and troubleshooting', link: '/faq' }
    ]
  }
]

const isExternal = (link: string) => /^https?:/.test(link)
</script>

<template>
  <div class="mc-home">
    <section class="hero">
      <div class="glow" aria-hidden="true" />
      <h1 class="title"><ManaTitle /></h1>
      <p class="tagline">
        <template v-if="totalSources">Browse {{ totalSources }} 3rd Party sources for Mana</template>
        <template v-else>3rd Party sources for Mana, coming soon</template>
      </p>

      <form class="search" role="search" @submit.prevent="search">
        <span class="mc-icon i-search" />
        <input v-model="query" type="search" placeholder="Search sources…" aria-label="Search sources" autocomplete="off">
        <kbd>Enter</kbd>
        <ul v-if="results.length" class="results">
          <li v-for="{ source, repo } in results" :key="repo.slug + source.id" :class="{ 'is-nsfw': source.rating === 'nsfw' }">
            <a :href="installLink(source, repo)" :title="`Install ${source.name} in Mana`">
              <SourceIcon :src="source.icon" :name="source.name" :size="28" />
              <span class="r-name">{{ source.name }}<small>{{ host(source.website) }}</small></span>
              <span class="mc-chip" :class="source.rating">{{ ratingLabel[source.rating] }}</span>
            </a>
          </li>
        </ul>
        <p v-else-if="query.trim()" class="results empty">No source matches “{{ query }}”.</p>
      </form>

      <div v-if="featured.length" class="marquee" aria-hidden="true">
        <div class="track">
          <SourceIcon v-for="(s, i) in [...featured, ...featured]" :key="i" :src="s.icon" :name="s.name" :size="34" />
        </div>
      </div>
    </section>

    <div class="groups">
      <section v-for="g in groups" :key="g.title" class="group">
        <h2>{{ g.title }} <span class="mc-icon i-chevron" /></h2>
        <a
          v-for="l in g.links"
          :key="l.title"
          class="item"
          :href="isExternal(l.link) ? l.link : withBase(l.link)"
          :target="isExternal(l.link) ? '_blank' : undefined"
          :rel="isExternal(l.link) ? 'noreferrer' : undefined"
        >
          <span class="item-icon"><span class="mc-icon" :class="`i-${l.icon}`" /></span>
          <span class="item-text">
            <strong>{{ l.title }}</strong>
            <span>{{ l.text }}</span>
          </span>
        </a>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 80px 0 56px;
  text-align: center;
}
.glow {
  position: absolute;
  top: 30px;
  left: 50%;
  width: min(560px, 90%);
  height: 200px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--mc-accent-2) 30%, transparent), transparent);
  filter: blur(40px);
  opacity: .6;
  pointer-events: none;
}

.title {
  position: relative;
  margin: 0;
  border: 0;
  padding: 0;
  line-height: 0;
}
.tagline {
  position: relative;
  margin: 0 !important;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(480px, 100%);
  height: 46px;
  margin-top: 14px;
  padding: 0 12px 0 16px;
  border: 1px solid var(--mc-card-border);
  border-radius: 12px;
  background: var(--mc-card-bg);
  color: var(--vp-c-text-3);
  transition: border-color .2s;
}
.search:focus-within { border-color: var(--vp-c-brand-1); }
.search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 15px;
}
.search kbd {
  font: 500 11px var(--vp-font-family-mono);
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 5;
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  text-align: left;
}
.results.empty { padding: 12px 14px; font-size: 14px; color: var(--vp-c-text-2); }
.results a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 8px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.results a:hover { background: var(--vp-c-bg-soft); }
.r-name { display: grid; flex: 1; font-size: 14px; font-weight: 600; line-height: 1.3; }
.r-name small { font-size: 12px; font-weight: 400; color: var(--vp-c-text-3); }

.marquee {
  width: min(720px, 100%);
  overflow: hidden;
  margin-top: 18px;
  mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent);
}
.track { display: flex; gap: 10px; width: max-content; animation: mc-scroll 40s linear infinite; }
@keyframes mc-scroll { to { transform: translateX(-50%); } }

/* Columns hug their links and the pair is centered, so it lines up under the hero. */
.groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 360px));
  justify-content: center;
  gap: 32px 96px;
}
@media (max-width: 860px) { .groups { grid-template-columns: 1fr; gap: 24px; } }
.group { display: grid; align-content: start; gap: 2px; }
.group h2 {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 8px !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 18px !important;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.group h2 .mc-icon { transform: rotate(-90deg); font-size: 16px; color: var(--vp-c-text-3); }
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 -10px;
  padding: 9px 10px;
  border-radius: 10px;
  color: inherit;
  text-decoration: none !important;
  transition: background-color .2s;
}
.item:hover { background: var(--vp-c-bg-soft); }
.item-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 17px;
}
.item-text { display: grid; min-width: 0; line-height: 1.35; }
.item-text strong { font-size: 14px; color: var(--vp-c-text-1); }
.item-text span { font-size: 13px; color: var(--vp-c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item:hover .item-text strong { color: var(--vp-c-brand-1); }
</style>
