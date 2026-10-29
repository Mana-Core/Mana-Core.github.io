<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ src?: string; name: string; size?: number }>()
const failed = ref(false)
</script>

<template>
  <span class="mc-src-icon" :style="{ width: `${size ?? 32}px`, height: `${size ?? 32}px` }">
    <img v-if="src && !failed" :src="src" :alt="''" loading="lazy" @error="failed = true">
    <span v-else>{{ name.charAt(0) }}</span>
  </span>
</template>

<style scoped>
.mc-src-icon {
  display: inline-grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border-radius: 8px;
  background: var(--mc-tile-bg);
  color: var(--vp-c-brand-1);
  font-weight: 700;
  font-size: 14px;
}
.mc-src-icon img { width: 100%; height: 100%; object-fit: cover; }
</style>
