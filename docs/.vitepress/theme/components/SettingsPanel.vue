<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { accents } from '../accents'
import { isDefault, resetSettings, useSettings, type Settings } from '../settings'

const settings = useSettings()
const open = ref(false)
const allAccents = ref(false)
const root = ref<HTMLElement>()

// Collapsed, show the first few accents plus the selected one.
const COLLAPSED = 6
const shownAccents = computed(() => {
  if (allAccents.value) return accents
  const first = accents.slice(0, COLLAPSED)
  const current = accents.find(a => a.id === settings.accent)
  return current && !first.includes(current) ? [...first, current] : first
})
const hiddenCount = computed(() => accents.length - shownAccents.value.length)

type Toggle = { key: keyof Settings; label: string }
const sections: { title: string; toggles: Toggle[] }[] = [
  {
    title: 'Appearance',
    toggles: [
      { key: 'accentBackground', label: 'Tinted background' },
      { key: 'effects', label: 'Motion' }
    ]
  },
  {
    title: 'Content',
    toggles: [
      { key: 'icons', label: 'Source icons' },
      { key: 'nsfw', label: 'NSFW sources' }
    ]
  }
]

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="mc-settings">
    <button class="mc-settings-btn" :class="{ active: open }" aria-label="Site settings" :aria-expanded="open" @click="open = !open">
      <span class="mc-icon i-settings" />
    </button>

    <Transition name="mc-pop">
      <div v-if="open" class="mc-settings-panel" role="dialog" aria-label="Site settings">
        <section v-for="(section, i) in sections" :key="section.title" class="mc-sheet-section">
          <h3>{{ section.title }}</h3>

          <div v-if="i === 0" class="mc-chips" role="radiogroup" aria-label="Accent color">
            <button
              v-for="a in shownAccents"
              :key="a.id"
              class="mc-chip-btn"
              :class="{ on: a.id === settings.accent }"
              role="radio"
              :aria-checked="a.id === settings.accent"
              @click="settings.accent = a.id"
            >
              <b :style="{ background: a.colors[0] }" />{{ a.name }}
            </button>
            <button v-if="hiddenCount > 0" class="mc-chip-btn more" @click="allAccents = true">+{{ hiddenCount }}</button>
          </div>

          <label v-for="t in section.toggles" :key="t.key" class="mc-switch-row">
            <span>{{ t.label }}</span>
            <input v-model="(settings as any)[t.key]" type="checkbox" role="switch" class="mc-switch">
          </label>
        </section>

        <button v-if="!isDefault(settings)" class="mc-reset" @click="resetSettings(); allAccents = false">
          Reset to defaults
        </button>
      </div>
    </Transition>
  </div>
</template>
