<template>
  <div class="project-list">
    <div class="toolbar">
      <div class="search-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input 
          v-model="searchQuery" 
          :placeholder="t('searchPlaceholder')" 
          class="search-input"
        />
      </div>
      <button @click="showAddProject = true" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        {{ t('addProject') }}
      </button>
    </div>

    <div class="projects-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-card"
        @click="goToDetail(project.id)"
      >
        <div class="card-top">
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </div>
          <span :class="['status-badge', project.status]">
            {{ statusLabel(project.status) }}
          </span>
        </div>
        <h3 class="card-title">{{ project.name }}</h3>
        <p class="card-desc">{{ project.description || t('noDescription') }}</p>
        <div class="card-tags">
          <span class="tag">{{ project.type }}</span>
          <span class="tag">{{ project.tech }}</span>
        </div>
        <div class="card-progress">
          <div class="progress-header">
            <span class="progress-label">{{ t('progress') }}</span>
            <span class="progress-value">{{ project.progress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
          </div>
        </div>
        <div class="card-footer">
          <span class="task-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
            {{ project.tasks?.length || 0 }} {{ t('tasks') }}
          </span>
          <span>{{ project.createdAt }}</span>
        </div>
      </div>
    </div>

    <div v-if="showAddProject" class="modal-overlay" @click.self="showAddProject = false">
      <div class="modal">
        <h2>{{ t('addProjectTitle') }}</h2>
        <form @submit.prevent="addProject">
          <div class="form-group">
            <label>{{ t('projectName') }}</label>
            <input v-model="newProject.name" required :placeholder="t('projectNamePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ t('description') }}</label>
            <textarea v-model="newProject.description" rows="2" :placeholder="t('descriptionPlaceholder')"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('type') }}</label>
              <select v-model="newProject.type">
                <option>Chrome Extension</option>
                <option>macOS Desktop App</option>
                <option>Shell Script</option>
                <option>Full-Stack Web App</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t('tech') }}</label>
              <input v-model="newProject.tech" :placeholder="t('techPlaceholder')" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddProject = false" class="btn">{{ t('cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ t('add') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects, addProject as apiAddProject } from '../api/index.js'
import { useI18n } from '../composables/i18n.js'

const router = useRouter()
const { t, locale } = useI18n()
const projects = ref([])
const searchQuery = ref('')
const showAddProject = ref(false)
const newProject = ref({ name: '', description: '', type: 'Chrome Extension', tech: '' })

const emit = defineEmits(['statsChange'])

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  const q = searchQuery.value.toLowerCase()
  return projects.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q) ||
    p.tech.toLowerCase().includes(q)
  )
})

function statusLabel(status) {
  const map = { active: t('active'), paused: t('paused'), completed: t('completedStatus'), archived: t('archived') }
  return map[status] || status
}

function goToDetail(id) {
  router.push({ name: 'detail', params: { id } })
}

function updateStats() {
  const allTasks = projects.value.flatMap(p => p.tasks || [])
  emit('statsChange', {
    projects: projects.value.length,
    tasks: allTasks.length,
    completed: allTasks.filter(task => task.status === 'done').length
  })
}

async function loadProjects() {
  projects.value = await getProjects()
  updateStats()
}

async function addProject() {
  await apiAddProject({
    ...newProject.value,
    id: newProject.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  })
  showAddProject.value = false
  newProject.value = { name: '', description: '', type: 'Chrome Extension', tech: '' }
  await loadProjects()
}

onMounted(loadProjects)
</script>
