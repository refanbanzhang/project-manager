<template>
  <div class="project-detail">
    <div class="detail-header">
      <button @click="$emit('back')" class="btn btn-back">← 返回</button>
      <div class="header-info">
        <h2>{{ project.name }}</h2>
        <p>{{ project.description }}</p>
      </div>
      <div class="header-actions">
        <select v-model="localStatus" @change="updateStatus" class="status-select">
          <option value="active">进行中</option>
          <option value="paused">已暂停</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-meta">
        <div class="meta-item">
          <span class="meta-label">类型</span>
          <span>{{ project.type }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">技术栈</span>
          <span>{{ project.tech }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">进度</span>
          <div class="progress-control">
            <input 
              type="range" 
              v-model.number="localProgress" 
              @input="updateProgress"
              min="0" 
              max="100" 
            />
            <span>{{ localProgress }}%</span>
          </div>
        </div>
      </div>

      <div class="tasks-section">
        <div class="tasks-header">
          <h3>任务清单</h3>
          <button @click="showAddTask = true" class="btn btn-primary btn-sm">+ 添加任务</button>
        </div>

        <div class="tasks-list">
          <div 
            v-for="task in sortedTasks" 
            :key="task.id" 
            :class="['task-item', task.status]"
          >
            <input 
              type="checkbox" 
              :checked="task.status === 'done'" 
              @change="toggleTask(task)"
            />
            <div class="task-content">
              <span :class="{ 'task-done': task.status === 'done' }">{{ task.title }}</span>
              <div class="task-meta">
                <span :class="['priority-badge', task.priority]">
                  {{ priorityLabel(task.priority) }}
                </span>
                <span class="task-date">{{ task.createdAt }}</span>
              </div>
            </div>
            <button @click="removeTask(task)" class="btn-icon" title="删除">×</button>
          </div>
          
          <div v-if="!project.tasks?.length" class="empty-tasks">
            暂无任务，点击上方按钮添加
          </div>
        </div>
      </div>
    </div>

    <!-- 添加任务弹窗 -->
    <div v-if="showAddTask" class="modal-overlay" @click.self="showAddTask = false">
      <div class="modal modal-sm">
        <h3>添加新任务</h3>
        <form @submit.prevent="addTask">
          <div class="form-group">
            <label>任务标题</label>
            <input v-model="newTask.title" required />
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="newTask.priority">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddTask = false" class="btn">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { updateProject, addTask as apiAddTask, updateTask, deleteTask } from '../api/index.js'

const props = defineProps({
  project: { type: Object, required: true }
})

const emit = defineEmits(['back', 'updated'])

const localProgress = ref(props.project.progress)
const localStatus = ref(props.project.status)
const showAddTask = ref(false)
const newTask = ref({ title: '', priority: 'medium' })

const sortedTasks = computed(() => {
  if (!props.project.tasks) return []
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...props.project.tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
  })
})

function priorityLabel(p) {
  return { high: '高', medium: '中', low: '低' }[p] || p
}

async function updateStatus() {
  await updateProject(props.project.id, { status: localStatus.value })
  emit('updated')
}

async function updateProgress() {
  await updateProject(props.project.id, { progress: localProgress.value })
  emit('updated')
}

async function addTask() {
  await apiAddTask(props.project.id, newTask.value)
  showAddTask.value = false
  newTask.value = { title: '', priority: 'medium' }
  emit('updated')
}

async function toggleTask(task) {
  const newStatus = task.status === 'done' ? 'todo' : 'done'
  await updateTask(props.project.id, task.id, { status: newStatus })
  emit('updated')
}

async function removeTask(task) {
  await deleteTask(props.project.id, task.id)
  emit('updated')
}
</script>
