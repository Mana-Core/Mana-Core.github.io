import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import HomePage from './components/HomePage.vue'
import AllSources from './components/AllSources.vue'
import ThemeGrid from './components/ThemeGrid.vue'
import './icons.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('AllSources', AllSources)
    app.component('ThemeGrid', ThemeGrid)
  }
} satisfies Theme
