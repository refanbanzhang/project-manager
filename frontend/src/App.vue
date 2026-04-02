<template>
  <div class="app">
    <header class="header">
      <h1>项目进度管理</h1>
      <div class="header-stats">
        <span>{{ projects.length }} 个项目</span>
        <span>{{ totalTasks }} 个任务</span>
        <span>{{ completedTasks }} 已完成</span>
      </div>
    </header>
    
    <main class="main">
      <!-- 项目列表视图 -->
      <div v-if="!selectedProject" class="project-list">
        <div class="toolbar">
          <input 
            v-model="searchQuery" 
            placeholder="搜索项目..." 
            class="search-input"
          />
          <button @click="showAddProject = true" class="btn btn-primary">
            + 添加项目
          </button>
        </div>

        <div class="projects-grid">
          <div 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="project-card"
            @click="selectProject(project)"
          >
            <div class="card-header">
              <h3>{{ project.name }}</h3>
              <span :class="['status-badge', project.status]">
                {{ statusLabel(project.status) }}
              </span>
            </div>
            <p class="card-desc">{{ project.description }}</p>
            <div class="card-meta">
              <span class="tech-tag">{{ project.tech }}</span>
              <span class="type-tag">{{ project.type }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: project.progress + '%' }"
              ></div>
            </div>
            <div class="card-footer">
              <span>{{ project.tasks?.length || 0 }} 个任务</span>
              <span>{{ project.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目详情视图 -->
      <ProjectDetail 
        v-else 
        :project="selectedProject"
        @back="selectedProject = null"
        @updated="loadProjects"
      />
    </main>

    <!-- 添加项目弹窗 -->
    <div v-if="showAddProject" class="modal-overlay" @click.self="showAddProject = false">
      <div class="modal">
        <h2>添加新项目</h2>
        <form @submit.prevent="addProject">
          <div class="form-group">
            <label>项目名称</label>
            <input v-model="newProject.name" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newProject.description" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <select v-model="newProject.type">
                <option>Chrome Extension</option>
                <option>macOS Desktop App</option>
                <option>Shell Script</option>
                <option>Full-Stack Web App</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>技术栈</label>
              <input v-model="newProject.tech" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddProject = false" class="btn">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects, addProject as apiAddProject } from './api/index.js'
import ProjectDetail from './components/ProjectDetail.vue'

const projects = ref([])
const selectedProject = ref(null)
const searchQuery = ref('')
const showAddProject = ref(false)
const newProject = ref({
  name: '',
  description: '',
  type: 'Chrome Extension',
  tech: ''
})

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  const q = searchQuery.value.toLowerCase()
  return projects.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q) ||
    p.tech.toLowerCase().includes(q)
  )
})

const totalTasks = computed(() => 
  projects.value.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
)

const completedTasks = computed(() => 
  projects.value.reduce((sum, p) => 
    sum + (p.tasks?.filter(t => t.status === 'done').length || 0), 0)
)

function statusLabel(status) {
  const map = { active: '进行中', paused: '已暂停', completed: '已完成', archived: '已归档' }
  return map[status] || status
}

async function loadProjects() {
  projects.value = await getProjects()
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

function selectProject(project) {
  selectedProject.value = project
}

onMounted(loadProjects)
</script>
