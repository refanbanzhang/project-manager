<template>
  <div class="project-detail">
    <div class="detail-top">
      <router-link to="/" class="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        {{ t('back') }}
      </router-link>
      <div class="detail-info">
        <h2 v-if="project">{{ project.name }}</h2>
        <p v-if="project">{{ project.description || t('noDescription') }}</p>
      </div>
      <div class="detail-actions">
        <select v-model="localStatus" @change="updateStatus" class="status-select">
          <option value="active">{{ t('active') }}</option>
          <option value="paused">{{ t('paused') }}</option>
          <option value="completed">{{ t('completedStatus') }}</option>
          <option value="archived">{{ t('archived') }}</option>
        </select>
      </div>
    </div>

    <div v-if="project">
      <div class="meta-grid">
        <div class="meta-card">
          <div class="meta-label">{{ t('type') }}</div>
          <div class="meta-value">{{ project.type }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">{{ t('tech') }}</div>
          <div class="meta-value">{{ project.tech }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">{{ t('progress') }}</div>
          <div class="progress-control">
            <input type="range" v-model.number="localProgress" @input="updateProgress" min="0" max="100" />
            <span>{{ localProgress }}%</span>
          </div>
        </div>
      </div>

      <div class="tasks-section">
        <div class="tasks-header">
          <h3>{{ t('taskList') }} ({{ project.tasks?.length || 0 }})</h3>
          <button @click="showAddTask = true" class="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            {{ t('addTask') }}
          </button>
        </div>

        <div class="tasks-list">
          <div v-for="task in sortedTasks" :key="task.id" :class="['task-item', task.status]">
            <label class="task-checkbox">
              <input type="checkbox" :checked="task.status === 'done'" @change="toggleTask(task)" />
              <span class="checkmark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L19 7"/></svg>
              </span>
            </label>
            <div class="task-content">
              <div class="task-title" :class="{ 'task-done': task.status === 'done' }">{{ task.title }}</div>
              <div class="task-meta">
                <span :class="['priority-badge', task.priority]">
                  {{ priorityLabel(task.priority) }}
                </span>
                <span class="task-date">{{ task.createdAt }}</span>
              </div>
            </div>
            <button @click="removeTask(task)" class="btn-icon" :title="t('cancel')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <div v-if="!project.tasks?.length" class="empty-tasks">
            <p>{{ t('noTasks') }}</p>
            <span class="empty-sub">{{ t('noTasksSub') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('loading') }}</div>

    <div v-if="showAddTask" class="modal-overlay" @click.self="showAddTask = false">
      <div class="modal modal-sm">
        <h3>{{ t('addTaskTitle') }}</h3>
        <form @submit.prevent="addTask">
          <div class="form-group">
            <label>{{ t('taskTitle') }}</label>
            <input v-model="newTask.title" required :placeholder="t('taskTitlePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ t('priority') }}</label>
            <select v-model="newTask.priority">
              <option value="high">{{ t('high') }}</option>
              <option value="medium">{{ t('medium') }}</option>
              <option value="low">{{ t('low') }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddTask = false" class="btn">{{ t('cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ t('add') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject, updateProject, addTask as apiAddTask, updateTask, deleteTask } from '../api/index.js'
import { useI18n } from '../composables/i18n.js'

const route = useRoute()
const { t } = useI18n()
const project = ref(null)
const loading = ref(true)
const localProgress = ref(0)
const localStatus = ref('active')
const showAddTask = ref(false)
const newTask = ref({ title: '', priority: 'medium' })

const sortedTasks = computed(() => {
  if (!project.value?.tasks) return []
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...project.value.tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
  })
})

function priorityLabel(p) {
  return { high: t('high'), medium: t('medium'), low: t('low') }[p] || p
}

async function loadProject() {
  loading.value = true
  project.value = await getProject(route.params.id)
  localProgress.value = project.value.progress
  localStatus.value = project.value.status
  loading.value = false
}

async function updateStatus() {
  await updateProject(project.value.id, { status: localStatus.value })
  await loadProject()
}

async function updateProgress() {
  await updateProject(project.value.id, { progress: localProgress.value })
  await loadProject()
}

async function addTask() {
  await apiAddTask(project.value.id, newTask.value)
  showAddTask.value = false
  newTask.value = { title: '', priority: 'medium' }
  await loadProject()
}

async function toggleTask(task) {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  await updateTask(project.value.id, task.id, { status: newStatus })
  await loadProject()
}

async function removeTask(task) {
  await deleteTask(project.value.id, task.id)
  await loadProject()
}

onMounted(loadProject)
</script>
