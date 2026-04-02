"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/components/providers";
import { fetchProject, updateProject, addTask, updateTask, deleteTask } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" });
  const [localProgress, setLocalProgress] = useState(0);
  const [localStatus, setLocalStatus] = useState("active");

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const data = await fetchProject(id);
    setProject(data);
    setLocalProgress(data.progress);
    setLocalStatus(data.status);
    setLoading(false);
  }

  async function handleStatusChange(val: string) {
    setLocalStatus(val);
    await updateProject(id, { status: val });
    load();
  }

  async function handleProgressChange(val: number) {
    setLocalProgress(val);
    await updateProject(id, { progress: val });
    load();
  }

  async function handleAddTask() {
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
  const statusMap: any = { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };
  const statusVariant: any = { active: "primary", paused: "warning", completed: "success", archived: "default" };
  const priorityVariant: any = { high: "destructive", medium: "warning", low: "success" };

  const sortedTasks = project?.tasks
    ? [...project.tasks].sort((a: any, b: any) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const po: any = { high: 0, medium: 1, low: 2 };
        return (po[a.priority] || 1) - (po[b.priority] || 1);
      })
    : [];

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">{t("loading")}</div>;
  if (!project) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Not found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-4 left-4 right-4 z-50 flex items-center justify-between h-16 px-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          {t("back")}
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
            {lang === "zh" ? "EN" : "中文"}
          </button>
          <button onClick={toggleTheme} className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
            <p className="text-zinc-400">{project.description || t("noDescription")}</p>
          </div>
          <Select value={localStatus} onChange={(e: any) => handleStatusChange(e.target.value)}>
            <option value="active">{t("active")}</option>
            <option value="paused">{t("paused")}</option>
            <option value="completed">{t("completedStatus")}</option>
            <option value="archived">{t("archived")}</option>
          </Select>
        </div>

        {/* Meta Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("type")}</div>
            <div className="font-semibold">{project.type}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("tech")}</div>
            <div className="font-semibold">{project.tech}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("progress")}</span>
              <span className="text-xl font-bold text-indigo-400">{localProgress}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={localProgress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold">{t("taskList")} ({project.tasks?.length || 0})</h2>
            <Button variant="primary" size="sm" onClick={() => setShowTaskModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {t("addTask")}
            </Button>
          </div>

          <div className="p-2">
            {sortedTasks.map((task: any) => (
              <div key={task.id} className={`flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-zinc-800/50 ${task.status === "done" ? "opacity-50" : ""}`}>
                <button
                  onClick={() => toggleTask(task)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === "done" ? "bg-indigo-500 border-indigo-500" : "border-zinc-600 hover:border-indigo-400"}`}
                >
                  {task.status === "done" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L19 7"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${task.status === "done" ? "line-through text-zinc-500" : ""}`}>{task.title}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant={priorityVariant[task.priority] || "default"}>{priorityLabel[task.priority]}</Badge>
                    <span className="text-xs text-zinc-500">{task.createdAt}</span>
                  </div>
                </div>
                <button onClick={() => removeTask(task)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}

            {!sortedTasks.length && (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-sm mb-1">{t("noTasks")}</p>
                <p className="text-xs opacity-70">{t("noTasksSub")}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title={t("addTaskTitle")}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("taskTitle")}</label>
            <Input value={newTask.title} onChange={(e: any) => setNewTask({ ...newTask, title: e.target.value })} placeholder={t("taskTitle")} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("priority")}</label>
            <Select value={newTask.priority} onChange={(e: any) => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="high">{t("high")}</option>
              <option value="medium">{t("medium")}</option>
              <option value="low">{t("low")}</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowTaskModal(false)}>{t("cancel")}</Button>
            <Button variant="primary" onClick={handleAddTask}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
