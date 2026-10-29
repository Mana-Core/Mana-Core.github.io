<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <button
    class="mc-theme-toggle"
    type="button"
    role="switch"
    :aria-checked="isDark"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    aria-label="Toggle dark theme"
    @click="isDark = !isDark"
  >
    <!-- Both render; CSS keyed on html.dark picks one, so SSR never mismatches. -->
    <span class="mc-icon i-moon moon" />
    <span class="mc-icon i-sun sun" />
  </button>
</template>

<style scoped>
.mc-theme-toggle {
  position: relative;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 18px;
  transition: color .2s;
}
.mc-theme-toggle:hover { color: var(--vp-c-brand-1); }
.mc-theme-toggle .mc-icon {
  grid-area: 1 / 1;
  transition: opacity .25s, transform .35s;
}
.sun { opacity: 1; transform: none; }
.moon { opacity: 0; transform: rotate(-60deg) scale(.6); }
html.dark .sun { opacity: 0; transform: rotate(60deg) scale(.6); }
html.dark .moon { opacity: 1; transform: none; }
</style>
