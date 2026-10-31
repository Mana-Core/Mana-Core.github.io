<script setup lang="ts">
import { useId } from 'vue'
import type { Screen } from '../screens'
import type { ManaTheme } from '../themes.data'

defineProps<{ screen: Screen; theme: ManaTheme }>()

// Gradient ids are global to the page, and a gradient takes its colors from where it's
// defined, so a shared id would paint every phone in the first theme.
const id = useId()

function colors(theme: ManaTheme) {
  const vars = Object.entries(theme.colors).map(([key, value]) => [`--t-${key}`, value])
  return Object.fromEntries([...vars, ['--scrim', `url(#${id}-scrim)`], ['--fade', `url(#${id}-fade)`]])
}
</script>

<template>
  <svg
    class="screen"
    viewBox="0 0 497 1024"
    role="img"
    :aria-label="`${screen.title} screen in ${theme.name}`"
    :style="colors(theme)"
  >
    <defs>
      <linearGradient :id="`${id}-scrim`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" class="stop-overlay" stop-opacity="0" />
        <stop offset="1" class="stop-overlay" />
      </linearGradient>
      <linearGradient :id="`${id}-fade`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" class="stop-background" stop-opacity="0" />
        <stop offset="1" class="stop-background" />
      </linearGradient>
    </defs>
    <component :is="shape.tag" v-for="(shape, i) in screen.shapes" :key="i" v-bind="shape.attrs" />
  </svg>
</template>

<style scoped>
.screen {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8%/3.9%;
  background: var(--t-background);
  box-shadow: 0 0 0 1px var(--mc-card-border);
}
.stop-overlay { stop-color: var(--t-contentTileOverlay); }
.stop-background { stop-color: var(--t-background); }

/* A solid bar carries far more ink than the text it stands in for. */
.label { fill: var(--t-label); fill-opacity: .8; }
.muted { fill: var(--t-secondaryLabel); fill-opacity: .7; }
.accent { fill: var(--t-accent); }
.accent-soft { fill: var(--t-accent); fill-opacity: .25; }
.on-accent { fill: var(--t-foregroundOnAccent); }
.secondary { fill: var(--t-secondaryBackground); }
.tertiary { fill: var(--t-tertiaryBackground); }
.separator { fill: var(--t-separator); }
.info { fill: var(--t-statusInfo); }
.destructive { fill: var(--t-statusDestructive); }
.overlay { fill: var(--t-contentTileOverlay); }
.scrim { fill: var(--scrim); }
.fade { fill: var(--fade); }
.glass { fill: var(--t-secondaryBackground); fill-opacity: .92; stroke: var(--t-separator); }
.raised { fill: var(--t-secondaryBackground); stroke: var(--t-separator); }
.card { fill: var(--t-secondaryBackground); stroke: var(--t-separator); }
.chip { fill: var(--t-secondaryBackground); stroke: var(--t-separator); }
.info-chip { fill: var(--t-statusInfo); fill-opacity: .12; stroke: var(--t-statusInfo); }
</style>
