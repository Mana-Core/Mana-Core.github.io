<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { useSettings } from './settings'

const { Layout } = DefaultTheme

// Loads saved settings and applies them on the client.
onMounted(() => useSettings())
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ThemeToggle class="mc-nav-theme" />
      <SettingsPanel />
    </template>
  </Layout>
</template>
