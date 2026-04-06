"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/components/providers";
import { fetchProject, updateProject, addTask, updateTask, deleteTask } from "@/lib/api";
import type { Project, Task, NewTask, TaskPriority, ProjectStatus } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { StatusDropdown } from "@/components/Dropdown";
import {
  Button,
  Chip,
  Card,
  Input,
  Checkbox,
  Select,
  ListBox,
  ListBoxItem,
} from "@heroui/react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[var(--bg-secondary)] rounded-none ${className}`} />;
}

interface ProjectHeaderProps {
  project: Project;
  localStatus: string;
  statusColor: Record<string, "default" | "danger" | "success" | "warning" | "accent">;
  statusMap: Record<string, string>;
  onStatusChange: (status: string) => void;
}

function ProjectHeader({ project, localStatus, statusColor, statusMap, onStatusChange }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none bg-[var(--accent)] text-black glow-border">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-[family-name:var(--font-heading)]">{project.name}</h1>
            <Chip 
              size="sm" 
              color={statusColor[project.status] || "default"}
              variant="soft"
              className="font-medium"
            >
              {statusMap[project.status] || project.status}
            </Chip>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Chip size="sm" variant="soft" className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">{project.type}</Chip>
            <Chip size="sm" variant="soft" className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">{project.tech}</Chip>
          </div>
          {(project.description || project.summary) && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {project.description || project.summary}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <StatusDropdown
          value={localStatus}
          onChange={onStatusChange}
          statusMap={statusMap}
        />
      </div>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="square"
          className="transition-all duration-500 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[var(--accent)] glow-text">{progress}%</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  colorClass: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, colorClass, icon }: StatCardProps) {
  return (
    <Card className="cyber-card border-[var(--border-primary)]">
      <Card.Content className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-none ${colorClass}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">{title}</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</div>
        </div>
      </Card.Content>
    </Card>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  priorityLabel: Record<TaskPriority, string>;
  priorityColor: Record<TaskPriority, "default" | "danger" | "success" | "warning" | "accent">;
}

function TaskItem({ task, onToggle, onDelete, priorityLabel, priorityColor }: TaskItemProps) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--accent-soft)] transition-colors rounded-none">
      <Checkbox
        isSelected={task.status === "done"}
        onChange={() => onToggle(task)}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${
          task.status === "done" 
            ? "line-through text-[var(--text-tertiary)]" 
            : "text-[var(--text-primary)]"
        }`}>
          {task.title}
        </div>
      </div>
      <Chip 
        size="sm" 
        color={priorityColor[task.priority] || "default"} 
        variant="soft"
        className="text-[11px] hidden sm:flex bg-[var(--bg-secondary)]"
      >
        {priorityLabel[task.priority]}
      </Chip>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        onPress={() => onDelete(task)}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 min-w-0 text-[var(--text-tertiary)] hover:text-[var(--danger)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </Button>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  priorityLabel: Record<TaskPriority, string>;
  priorityColor: Record<TaskPriority, "default" | "danger" | "success" | "warning" | "accent">;
  t: (key: string) => string;
}

function TaskList({ tasks, onToggle, onDelete, priorityLabel, priorityColor, t }: TaskListProps) {
  const sortedTasks = tasks
    ? [...tasks].sort((a: Task, b: Task) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (po[a.priority || "medium"] || 1) - (po[b.priority || "medium"] || 1);
      })
    : [];

  const todoTasks = sortedTasks.filter((t: Task) => t.status !== "done");
  const doneTasks = sortedTasks.filter((t: Task) => t.status === "done");

  return (
    <Card className="cyber-card border-[var(--border-primary)] overflow-hidden">
      <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2 font-[family-name:var(--font-heading)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 4.9 2.9 2.9"/><path d="M2 12h4"/><path d="m4.9 19.1 2.9-2.9"/>
          </svg>
          {t("taskList")}
        </h2>
        <span className="text-xs text-[var(--text-tertiary)]">{sortedTasks.length} {t("tasks")}</span>
      </Card.Header>

      {sortedTasks.length > 0 ? (
        <Card.Content className="p-0 max-h-[400px] overflow-y-auto">
          {todoTasks.length > 0 && (
            <div className="px-2">
              <div className="px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
                {t("todo")} ({todoTasks.length})
              </div>
              <div className="space-y-0">
                {todoTasks.map((task: Task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete}
                    priorityLabel={priorityLabel}
                    priorityColor={priorityColor}
                  />
                ))}
              </div>
            </div>
          )}
          
          {doneTasks.length > 0 && (
            <div className="px-2 mt-4">
              <div className="px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
                {t("completed")} ({doneTasks.length})
              </div>
              <div className="space-y-0">
                {doneTasks.map((task: Task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete}
                    priorityLabel={priorityLabel}
                    priorityColor={priorityColor}
                  />
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      ) : (
        <Card.Content className="p-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-[var(--accent-soft)] border border-[var(--accent)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{t("noTasks")}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{t("noTasksSub")}</p>
        </Card.Content>
      )}
    </Card>
  );
}

function AddTaskForm({ newTask, setNewTask }: { newTask: NewTask; setNewTask: (t: NewTask) => void }) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">任务标题</label>
        <Input
          placeholder="任务标题"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">优先级</label>
        <Select
          selectedKey={newTask.priority}
          onSelectionChange={(key) => {
            const value = key?.toString() as TaskPriority;
            if (value) setNewTask({ ...newTask, priority: value });
          }}
        >
          <ListBox>
            <ListBoxItem id="high">高</ListBoxItem>
            <ListBoxItem id="medium">中</ListBoxItem>
            <ListBoxItem id="low">低</ListBoxItem>
          </ListBox>
        </Select>
      </div>
    </>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({ title: "", priority: "medium" });
  const [localStatus, setLocalStatus] = useState<string>("active");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProject(id);
      if (!data) {
        console.error("Project not found");
        setProject(null);
        return;
      }
      setProject(data);
      setLocalStatus(data.status);
    } catch (e) {
      console.error("Failed to load project:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(val: string) {
    setLocalStatus(val);
    await updateProject(id, { status: val as ProjectStatus });
    load();
  }

  async function handleAddTask() {
    if (!newTask.title.trim()) return;
    await addTask(id, newTask);
    setShowTaskModal(false);
    setNewTask({ title: "", priority: "medium" });
    load();
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateTask(id, task.id, { status: newStatus });
    load();
  }

  async function removeTask(task: Task) {
    await deleteTask(id, task.id);
    load();
  }

  const priorityLabel: Record<TaskPriority, string> = 
    { high: t("high"), medium: t("medium"), low: t("low") };
  const priorityColor: Record<TaskPriority, "default" | "danger" | "success" | "warning" | "accent"> = 
    { high: "danger", medium: "warning", low: "success" } as const;
  const statusColor: Record<string, "default" | "danger" | "success" | "warning" | "accent"> = 
    { active: "success", paused: "warning", completed: "default", archived: "default" } as const;
  const statusMap: Record<string, string> = 
    { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };

  const stats = useMemo(() => {
    if (!project?.tasks) return { doneCount: 0, todoCount: 0, completionRate: 0 };
    const doneCount = project.tasks.filter((t) => t.status === "done").length;
    const todoCount = project.tasks.length - doneCount;
    const completionRate = project.tasks.length ? Math.round(doneCount / project.tasks.length * 100) : 0;
    return { doneCount, todoCount, completionRate };
  }, [project]);

  if (loading) return (
    <div className="min-h-dvh bg-[var(--bg-primary)] bg-grid">
      <header className="sticky top-0 z-40 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Skeleton className="h-6 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-none" />
            <Skeleton className="h-8 w-8 rounded-none" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-6">
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-none" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-24 rounded-none" />
          <Skeleton className="h-24 rounded-none" />
          <Skeleton className="h-24 rounded-none" />
        </div>
        <Skeleton className="h-64 rounded-none" />
      </main>
    </div>
  );

  if (!project) return (
    <div className="min-h-dvh bg-[var(--bg-primary)] bg-grid flex items-center justify-center">
      <div className="text-center cyber-card p-8 rounded-none">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Not found</h2>
        <Link href="/" className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline">
          {t("back")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] bg-grid">
      <header className="sticky top-0 z-40 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            <span className="hidden sm:inline">{t("back")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setLang(lang === "zh" ? "en" : "zh")}
              className="font-medium text-[var(--text-secondary)]"
            >
              {lang === "zh" ? "EN" : "中文"}
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={toggleTheme}
              className="text-[var(--text-secondary)]"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-6">
        <ProjectHeader 
          project={project}
          localStatus={localStatus}
          statusColor={statusColor}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="cyber-card border-[var(--border-primary)] md:col-span-1">
            <Card.Content className="p-5 flex flex-col items-center">
              <div className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-4">{t("progress")}</div>
              <ProgressRing progress={project.progress} />
            </Card.Content>
          </Card>
          
          <StatCard 
            title={t("todo") || "待办"}
            value={stats.todoCount}
            subtitle={`${project.tasks?.length || 0} ${t("totalTasks") || "总任务"}`}
            colorClass="bg-[var(--warning-soft)] text-[var(--warning)] p-3 rounded-none"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          />
          
          <StatCard 
            title={t("completed") || "已完成"}
            value={stats.doneCount}
            subtitle={`${stats.completionRate}%`}
            colorClass="bg-[var(--success-soft)] text-[var(--success)] p-3 rounded-none"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>}
          />
        </div>

        <div className="flex justify-end mb-4">
          <Button
            className="btn-cyber-primary"
            size="sm"
            onPress={() => setShowTaskModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("addTask")}
          </Button>
        </div>

        <TaskList 
          tasks={project.tasks}
          onToggle={toggleTask}
          onDelete={removeTask}
          priorityLabel={priorityLabel}
          priorityColor={priorityColor}
          t={t}
        />
      </main>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={t("addTaskTitle")}
        footer={
          <>
            <Button variant="ghost" onPress={() => setShowTaskModal(false)}>{t("cancel")}</Button>
            <Button className="btn-cyber-primary" onPress={handleAddTask} isDisabled={!newTask.title.trim()}>{t("add")}</Button>
          </>
        }
      >
        <AddTaskForm newTask={newTask} setNewTask={setNewTask} />
      </Modal>
    </div>
  );
}
