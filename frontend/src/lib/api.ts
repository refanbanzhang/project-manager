import type { Project, NewProject, UpdateProjectData, Task, NewTask, UpdateTaskData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchProject(id: string): Promise<Project | null> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function updateProject(id: string, data: UpdateProjectData): Promise<Project | null> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function addProject(data: NewProject): Promise<Project | null> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function addTask(projectId: string, data: NewTask): Promise<Task | null> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateTask(projectId: string, taskId: string, data: UpdateTaskData): Promise<Task | null> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteTask(projectId: string, taskId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
  return res.ok;
}
