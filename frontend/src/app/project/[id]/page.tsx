"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/components/providers";
import { fetchProject, updateProject, addTask, updateTask, deleteTask } from "@/lib/api";
import {
  Button,
  Chip,
  Card,
  Input,
  Checkbox,
  ListBox,
  ListBoxItem,
  Select,
} from "@heroui/react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[var(--bg-tertiary)] rounded-lg ${className}`} />;
}

function StatusSelect({ value, onChange, statusColor, statusMap, t }: any) {
  const [open, setOpen] = useState(false);
  const statuses = ["active", "paused", "completed", "archived"];
  
  const colorMap: any = {
    active: "bg-[var(--success)]",
    paused: "bg-[var(--warning)]",
    completed: "bg-[var(--primary)]",
    archived: "bg-[var(--text-tertiary)]",
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full ${colorMap[value]}`} />
        <span className="text-sm font-medium text-[var(--text-primary)]">{statusMap[value]}</span>
        <svg className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg z-20">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => { onChange(status); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                  value === status ? 'bg-[var(--bg-secondary)]' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${colorMap[status]}`} />
                <span className="text-[var(--text-primary)]">{statusMap[status]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectHeader({ project, localStatus, statusColor, statusMap, onStatusChange, t }: any) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-[var(--accent)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">{project.name}</h1>
            <Chip 
              size="sm" 
              color={statusColor[project.status] || "default"} 
              variant="flat"
              className="font-medium"
            >
              {statusMap[project.status] || project.status}
            </Chip>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Chip size="sm" variant="flat" className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">{project.type}</Chip>
            <Chip size="sm" variant="flat" className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">{project.tech}</Chip>
          </div>
          {(project.description || project.summary) && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {project.description || project.summary}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <StatusSelect
          value={localStatus}
          onChange={onStatusChange}
          statusColor={statusColor}
          statusMap={statusMap}
          t={t}
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
          stroke="var(--bg-tertiary)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[var(--text-primary)]">{progress}%</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, colorClass, icon }: any) {
  return (
    <Card className="border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <Card.Content className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
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

function TaskItem({ task, onToggle, onDelete, priorityLabel, priorityColor, t }: any) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors rounded-lg">
      <Checkbox
        isSelected={task.status === "done"}
        onChange={() => onToggle(task)}
        className="flex-shrink-0"
        classNames={{
          wrapper: "before:border-[var(--border-subtle)]",
        }}
        size="lg"
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
        variant="flat"
        className="text-[11px] hidden sm:flex"
      >
        {priorityLabel[task.priority]}
      </Chip>
      <Button
        isIconOnly
        variant="light"
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

function TaskList({ tasks, onToggle, onDelete, priorityLabel, priorityColor, t }: any) {
  const sortedTasks = tasks
    ? [...tasks].sort((a: any, b: any) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const po: any = { high: 0, medium: 1, low: 2 };
        return (po[a.priority] || 1) - (po[b.priority] || 1);
      })
    : [];

  const todoTasks = sortedTasks.filter((t: any) => t.status !== "done");
  const doneTasks = sortedTasks.filter((t: any) => t.status === "done");

  return (
    <Card className="border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <Card.Header className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
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
              <div className="px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide sticky top-0 bg-[var(--bg-card)]">
                {t("todo")} ({todoTasks.length})
              </div>
              <div className="space-y-1">
                {todoTasks.map((task: any) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete}
                    priorityLabel={priorityLabel}
                    priorityColor={priorityColor}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
          
          {doneTasks.length > 0 && (
            <div className="px-2 mt-4">
              <div className="px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide sticky top-0 bg-[var(--bg-card)]">
                {t("completed")} ({doneTasks.length})
              </div>
              <div className="space-y-1">
                {doneTasks.map((task: any) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete}
                    priorityLabel={priorityLabel}
                    priorityColor={priorityColor}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      ) : (
        <Card.Content className="p-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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

function AddTaskModal({ isOpen, onClose, onAdd, newTask, setNewTask, t }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("addTaskTitle")}</h2>
          <Button isIconOnly variant="light" size="sm" onPress={onClose} className="text-[var(--text-tertiary)] h-8 w-8 min-w-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("taskTitle")}</label>
            <Input
              placeholder={t("taskTitle")}
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="bg-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("priority")}</label>
            <Select
              selectedKey={newTask.priority}
              onSelectionChange={(key) => setNewTask({ ...newTask, priority: String(key || "") })}
            >
              <ListBox>
                <ListBoxItem id="high">{t("high")}</ListBoxItem>
                <ListBoxItem id="medium">{t("medium")}</ListBoxItem>
                <ListBoxItem id="low">{t("low")}</ListBoxItem>
              </ListBox>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <Button variant="light" onPress={onClose}>{t("cancel")}</Button>
          <Button 
            variant="primary" 
            onPress={onAdd}
            isDisabled={!newTask.title.trim()}
          >
            {t("add")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" });
  const [localStatus, setLocalStatus] = useState("active");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchProject(id);
    setProject(data);
    setLocalStatus(data.status);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(val: string) {
    setLocalStatus(val);
    await updateProject(id, { status: val });
    load();
  }

  async function handleAddTask() {
    if (!newTask.title.trim()) return;
    await addTask(id, newTask);
    setShowTaskModal(false);
    setNewTask({ title: "", priority: "medium" });
    load();
  }

  async function toggleTask(task: any) {
    const s = task.status === "done" ? "todo" : "done";
    await updateTask(id, task.id, { status: s });
    load();
  }

  async function removeTask(task: any) {
    await deleteTask(id, task.id);
    load();
  }

  const priorityLabel: any = { high: t("high"), medium: t("medium"), low: t("low") };
  const priorityColor: any = { high: "danger", medium: "warning", low: "success" };
  const statusColor: any = { active: "primary", paused: "warning", completed: "success", archived: "default" };
  const statusMap: any = { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };

  const doneCount = project?.tasks?.filter((t: any) => t.status === "done").length || 0;
  const todoCount = (project?.tasks?.length || 0) - doneCount;
  const completionRate = project?.tasks?.length ? Math.round(doneCount / project.tasks.length * 100) : 0;

  if (loading) return (
    <div className="min-h-dvh bg-[var(--bg-secondary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Skeleton className="h-6 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-6">
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </main>
    </div>
  );

  if (!project) return (
    <div className="min-h-dvh bg-[var(--bg-secondary)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Not found</h2>
        <Link href="/" className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline">
          {t("back")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--bg-secondary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            <span className="hidden sm:inline">{t("back")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="light"
              size="sm"
              onPress={() => setLang(lang === "zh" ? "en" : "zh")}
              className="font-medium text-[var(--text-secondary)]"
            >
              {lang === "zh" ? "EN" : "中文"}
            </Button>
            <Button
              isIconOnly
              variant="light"
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
          t={t}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-[var(--border-subtle)] bg-[var(--bg-card)] md:col-span-1">
            <Card.Content className="p-5 flex flex-col items-center">
              <div className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-4">{t("progress")}</div>
              <ProgressRing progress={project.progress} />
            </Card.Content>
          </Card>
          
          <StatCard 
            title={t("todo") || "待办"}
            value={todoCount}
            subtitle={`${project.tasks?.length || 0} ${t("totalTasks") || "总任务"}`}
            colorClass="bg-[var(--warning)]/10 text-[var(--warning)]"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          />
          
          <StatCard 
            title={t("completed") || "已完成"}
            value={doneCount}
            subtitle={`${completionRate}%`}
            colorClass="bg-[var(--success)]/10 text-[var(--success)]"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>}
          />
        </div>

        <div className="flex justify-end mb-4">
          <Button
            variant="primary"
            size="sm"
            onPress={() => setShowTaskModal(true)}
            className="bg-[var(--accent)]"
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

      <AddTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onAdd={handleAddTask}
        newTask={newTask}
        setNewTask={setNewTask}
        t={t}
      />
    </div>
  );
}
