<script setup lang="ts">
import ThemeScreen from './ThemeScreen.vue'
import { addThemeLink } from '../data'
import { screens } from '../screens'
import { data as themes } from '../themes.data'
</script>

<template>
  <div class="themes">
    <section v-for="theme in themes" :key="theme.id" class="mc-card theme">
      <div class="head">
        <div class="title">
          <strong class="name">{{ theme.name }}</strong>
          <span v-if="theme.author" class="by">
            by
            <a v-if="theme.author.github" :href="`https://github.com/${theme.author.github}`" target="_blank">{{ theme.author.name }}</a>
            <template v-else>{{ theme.author.name }}</template>
          </span>
        </div>
        <a :href="theme.url" target="_blank" class="file-link">
          <span class="mc-icon i-code" /> JSON
        </a>
        <a class="mc-btn brand" :href="addThemeLink(theme)" :title="`Add ${theme.name} to Mana`">
          <span class="mc-icon i-download" /> Add to Mana
        </a>
      </div>
      <div class="screens" tabindex="0" :aria-label="`${theme.name} previews`">
        <ThemeScreen v-for="screen in screens" :key="screen.id" :screen="screen" :theme="theme" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.themes { display: grid; gap: 16px; margin-top: 20px; }
.theme { padding: 16px; gap: 14px; }
.head { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.title { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 2px; }
.name { font-size: 16px; line-height: 1.3; }
.by { font-size: 12px; color: var(--vp-c-text-2); }
.by a { color: inherit; }
.by a:hover { color: var(--vp-c-brand-1); }
.file-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--vp-c-text-2) !important;
  text-decoration: none !important;
}
.file-link:hover { color: var(--vp-c-brand-1) !important; }
.screens { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 640px) {
  /* Four phones at phone width would be too small to read, so they swipe instead. */
  .screens {
    grid-template-columns: repeat(4, 62%);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 1px;
  }
  .screens > * { scroll-snap-align: start; }
}
</style>
