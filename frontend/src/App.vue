<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="logo-link">{{ t('title') }}</router-link>
      </div>
      <div class="navbar-stats">
        <div class="stat-item">
          <span class="stat-dot projects"></span>
          <span>{{ stats.projects }} {{ t('projects') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-dot tasks"></span>
          <span>{{ stats.tasks }} {{ t('tasks') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-dot completed"></span>
          <span>{{ stats.completed }} {{ t('completed') }}</span>
        </div>
      </div>
      <div class="navbar-actions">
        <button class="icon-btn lang-btn" @click="toggleLang">
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>
        <button class="icon-btn" @click="toggleTheme" :aria-label="'Toggle theme'">
          <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </nav>
    <main class="main">
      <router-view :stats="stats" @stats-change="stats = $event" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n, useTheme } from './composables/i18n.js'

const stats = ref({ projects: 0, tasks: 0, completed: 0 })
const { locale, t, setLocale } = useI18n()
const { theme, toggleTheme } = useTheme()

function toggleLang() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}
</script>
