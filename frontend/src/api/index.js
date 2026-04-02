import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export function getProjects() {
  return api.get('/projects').then(r => r.data)
}

export function getProject(id) {
  return api.get(`/projects/${id}`).then(r => r.data)
}

export function updateProject(id, data) {
  return api.put(`/projects/${id}`, data).then(r => r.data)
}

export function addProject(data) {
  return api.post('/projects', data).then(r => r.data)
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`).then(r => r.data)
}

export function addTask(projectId, data) {
  return api.post(`/projects/${projectId}/tasks`, data).then(r => r.data)
}

export function updateTask(projectId, taskId, data) {
  return api.put(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data)
}

export function deleteTask(projectId, taskId) {
  return api.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data)
}
