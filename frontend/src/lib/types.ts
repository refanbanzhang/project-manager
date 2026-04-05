// Project and Task types

export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  summary?: string;
  type: string;
  tech: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  tasks: Task[];
}

export interface NewTask {
  title: string;
  priority?: TaskPriority;
}

export interface NewProject {
  id: string;
  name: string;
  description?: string;
  type: string;
  tech?: string;
}

export interface UpdateTaskData {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  type?: string;
  tech?: string;
  status?: ProjectStatus;
  progress?: number;
}
