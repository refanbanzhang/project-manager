import { createRouter, createWebHistory } from 'vue-router'
import ProjectList from '../views/ProjectList.vue'
import ProjectDetail from '../views/ProjectDetail.vue'

const routes = [
  { path: '/', name: 'list', component: ProjectList },
  { path: '/project/:id', name: 'detail', component: ProjectDetail, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
