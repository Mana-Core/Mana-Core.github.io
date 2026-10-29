<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SourceIcon from './SourceIcon.vue'
import { addRepoLink, count, installLink, ratingLabel, uniqueLanguages, type Rating, type Repo, type Source } from '../data'

// More than this many languages collapse into a "+N" tag so cards keep an even height.
const LANGUAGE_LIMIT = 2

function languageTags(source: Source) {
  const all = uniqueLanguages(source.languages)
  const rest = all.slice(LANGUAGE_LIMIT)
  return {
    shown: all.slice(0, LANGUAGE_LIMIT),
    more: rest.length ? { count: rest.length, title: rest.map(l => l.full).join('\n') } : null
  }
}

const props = defineProps<{
  items: { source: Source; repo: Repo }[]
  // The index lists every repository, so it offers a filter per repository.
  pickRepo?: boolean
}>()


const query = ref('')
const rating = ref<Rating | null>(null)
const badge = ref<string | null>(null)
const repoFilter = ref<string | null>(null)

// The home page search links here with ?q=.
onMounted(() => {
  query.value = new URLSearchParams(location.search).get('q') ?? ''
})

const ratings = computed(() => count(props.items, i => i.source.rating) as [Rating, number][])
const badges = computed(() => count(props.items, i => i.source.badges))

const repoOptions = computed(() => {
  const bySlug = new Map(props.items.map(({ repo }) => [repo.slug, repo]))
  return [...bySlug.values()].map(repo => ({
    repo,
    n: props.items.filter(i => i.repo.slug === repo.slug).length
  }))
})
const selectedRepo = computed(() => repoOptions.value.find(o => o.repo.slug === repoFilter.value)?.repo ?? null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.items.filter(({ source, repo }) =>
    (!repoFilter.value || repo.slug === repoFilter.value) &&
    (!rating.value || source.rating === rating.value) &&
    (!badge.value || source.badges.includes(badge.value)) &&
    (!q || source.name.toLowerCase().includes(q) || source.website?.toLowerCase().includes(q))
  )
})

function host(url?: string) {
  try { return url ? new URL(url).host.replace(/^www\./, '') : '' } catch { return url ?? '' }
}
</script>

<template>
  <div v-if="!items.length" class="mc-empty">
    No sources yet. Sources from Mana Core repositories show up here automatically once they're published.
  </div>
  <div v-else class="mc-sources">
    <div class="toolbar">
      <label class="mc-input">
        <span class="mc-icon i-search" />
        <input v-model="query" type="search" :placeholder="`Search ${items.length} sources…`" aria-label="Search sources">
      </label>
      <div class="mc-filters">
        <template v-if="pickRepo">
          <button
            v-for="{ repo, n } in repoOptions"
            :key="repo.slug"
            class="mc-filter"
            :class="{ on: repoFilter === repo.slug }"
            @click="repoFilter = repoFilter === repo.slug ? null : repo.slug"
          >
            {{ repo.name }} <span class="count">{{ n }}</span>
          </button>
          <span class="sep" />
        </template>
        <button
          v-for="[r, n] in ratings"
          :key="r"
          class="mc-filter"
          :class="{ on: rating === r, 'is-nsfw': r === 'nsfw' }"
          @click="rating = rating === r ? null : r"
        >
          {{ ratingLabel[r] }} <span class="count">{{ n }}</span>
        </button>
        <span v-if="badges.length" class="sep" />
        <button
          v-for="[b, n] in badges"
          :key="b"
          class="mc-filter"
          :class="{ on: badge === b }"
          @click="badge = badge === b ? null : b"
        >
          {{ b }} <span class="count">{{ n }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedRepo" class="repo-mini">
      <SourceIcon :src="selectedRepo.thumbnail" :name="selectedRepo.name" :size="44" />
      <div class="repo-mini-text">
        <strong>{{ selectedRepo.name }}</strong>
        <span>{{ selectedRepo.sources.length }} sources · {{ selectedRepo.owner }}</span>
      </div>
      <a class="mc-btn brand" :href="addRepoLink(selectedRepo)" title="Add this repository to Mana">
        <span class="mc-icon i-download" /> Add to Mana
      </a>
    </div>

    <div v-if="filtered.length" class="grid">
      <div
        v-for="{ source, repo } in filtered"
        :key="repo.slug + source.id"
        class="mc-card source"
        :class="{ 'is-nsfw': source.rating === 'nsfw' }"
      >
        <div class="head">
          <SourceIcon :src="source.icon" :name="source.name" :size="36" />
          <div class="title">
            <strong>{{ source.name }}</strong>
            <a v-if="source.website" class="host" :href="source.website" target="_blank" rel="noreferrer nofollow">{{ host(source.website) }}</a>
          </div>
          <span class="mc-chip" :class="source.rating">{{ ratingLabel[source.rating] }}</span>
        </div>
        <div class="meta">
          <span v-if="source.version" class="mc-chip">v{{ source.version }}</span>
          <span v-for="b in source.badges" :key="b" class="mc-chip accent">{{ b }}</span>
          <template v-for="tags in [languageTags(source)]" :key="source.id">
            <span v-for="l in tags.shown" :key="l.short" class="mc-chip" :title="l.full">{{ l.short }}</span>
            <span v-if="tags.more" class="mc-chip more" :title="tags.more.title">+{{ tags.more.count }}</span>
          </template>
        </div>
        <div class="foot">
          <a :href="installLink(source, repo)" class="install-link" :title="`Install ${source.name} in Mana`">
            <span class="mc-icon i-download" /> Install
          </a>
          <a :href="`${repo.url}/tree/${repo.branch}/${source.path}`" target="_blank" rel="noreferrer" class="code-link">
            <span class="mc-icon i-code" /> Source
          </a>
        </div>
      </div>
    </div>
    <div v-else class="mc-empty">No sources match your filters.</div>
  </div>
</template>

<style scoped>
.toolbar { display: grid; gap: 12px; margin: 16px 0 20px; }
.repo-mini {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.repo-mini-text { display: grid; flex: 1; min-width: 160px; line-height: 1.3; }
.repo-mini-text span { font-size: 12px; color: var(--vp-c-text-3); }
.sep { width: 1px; height: 20px; margin: 5px 4px; background: var(--vp-c-divider); }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.source { padding: 12px; gap: 10px; }
.head { display: flex; align-items: center; gap: 10px; }
.title { display: grid; min-width: 0; flex: 1; line-height: 1.3; }
.title strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.host {
  font-size: 12px;
  color: var(--vp-c-text-3) !important;
  text-decoration: none !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.host:hover { color: var(--vp-c-brand-1) !important; }
.meta { display: flex; flex-wrap: wrap; gap: 4px; }
.meta:empty { display: none; }
.meta .more { color: var(--vp-c-text-3); cursor: help; }
.foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12px;
}
.foot a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: var(--vp-c-text-2) !important;
  text-decoration: none !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.foot a:hover { color: var(--vp-c-brand-1) !important; }
.code-link { margin-left: auto; }
</style>
