<script setup lang="ts">
import SourceGrid from './SourceGrid.vue'
import { repos } from '../data'

const items = repos
  .flatMap(repo => repo.sources.map(source => ({ source, repo })))
  .sort((a, b) => a.source.name.localeCompare(b.source.name))
</script>

<template>
  <SourceGrid :items="items" pick-repo />
</template>
