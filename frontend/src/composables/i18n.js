import { ref, watch } from 'vue'

const messages = {
  zh: {
    title: '项目进度管理',
    projects: '个项目',
    tasks: '个任务',
    completed: '已完成',
    searchPlaceholder: '搜索项目名称、描述、技术栈...',
    addProject: '添加项目',
    addProjectTitle: '添加新项目',
    projectName: '项目名称',
    projectNamePlaceholder: '输入项目名称',
    description: '描述',
    descriptionPlaceholder: '简要描述项目功能',
    type: '类型',
    tech: '技术栈',
    techPlaceholder: 'Vue 3, Swift...',
    cancel: '取消',
    add: '添加',
    back: '返回',
    progress: '进度',
    taskList: '任务清单',
    addTask: '添加任务',
    addTaskTitle: '添加新任务',
    taskTitle: '任务标题',
    taskTitlePlaceholder: '输入任务标题',
    priority: '优先级',
    high: '高',
    medium: '中',
    low: '低',
    active: '进行中',
    paused: '已暂停',
    completedStatus: '已完成',
    archived: '已归档',
    noTasks: '暂无任务',
    noTasksSub: '点击上方按钮添加',
    loading: '加载中...',
    noDescription: '暂无描述'
  },
  en: {
    title: 'Project Manager',
    projects: 'Projects',
    tasks: 'Tasks',
    completed: 'Completed',
    searchPlaceholder: 'Search projects by name, description, tech...',
    addProject: 'Add Project',
    addProjectTitle: 'Add New Project',
    projectName: 'Project Name',
    projectNamePlaceholder: 'Enter project name',
    description: 'Description',
    descriptionPlaceholder: 'Brief project description',
    type: 'Type',
    tech: 'Tech Stack',
    techPlaceholder: 'Vue 3, Swift...',
    cancel: 'Cancel',
    add: 'Add',
    back: 'Back',
    progress: 'Progress',
    taskList: 'Tasks',
    addTask: 'Add Task',
    addTaskTitle: 'Add New Task',
    taskTitle: 'Task Title',
    taskTitlePlaceholder: 'Enter task title',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    active: 'Active',
    paused: 'Paused',
    completedStatus: 'Completed',
    archived: 'Archived',
    noTasks: 'No tasks yet',
    noTasksSub: 'Click the button above to add one',
    loading: 'Loading...',
    noDescription: 'No description'
  }
}

const locale = ref(localStorage.getItem('locale') || 'zh')
const theme = ref(localStorage.getItem('theme') || 'dark')

watch(locale, (val) => localStorage.setItem('locale', val))
watch(theme, (val) => localStorage.setItem('theme', val))

export function useI18n() {
  function t(key) {
    return messages[locale.value]?.[key] || messages.zh[key] || key
  }

  function setLocale(lang) {
    locale.value = lang
  }

  return { locale, t, setLocale, messages }
}

export function useTheme() {
  function setTheme(val) {
    theme.value = val
    document.documentElement.setAttribute('data-theme', val)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  setTheme(theme.value)
  return { theme, setTheme, toggleTheme }
}
