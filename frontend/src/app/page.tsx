"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { fetchProjects, addProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";

export default function HomePage() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProj, setNewProj] = useState({ name: "", description: "", type: "Chrome Extension", tech: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await fetchProjects();
    setProjects(data);
  }

  const filtered = (projects || []).filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tech?.toLowerCase().includes(q);
  });

  const allTasks = projects.flatMap((p) => p.tasks || []);
  const stats = {
    projects: projects.length,
    tasks: allTasks.length,
    completed: allTasks.filter((t: any) => t.status === "done").length,
  };

  async function handleAdd() {
    await addProject({ ...newProj, id: newProj.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") });
    setShowModal(false);
    setNewProj({ name: "", description: "", type: "Chrome Extension", tech: "" });
    load();
  }

  const statusMap: any = { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };
  const statusVariant: any = { active: "primary", paused: "warning", completed: "success", archived: "default" };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-4 left-4 right-4 z-50 flex items-center justify-between h-16 px-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
        <Link href="/" className="text-lg font-bold tracking-tight">{t("title")}</Link>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <span>{stats.projects} {t("projects")}</span>
          <span>{stats.tasks} {t("tasks")}</span>
          <span>{stats.completed} {t("completed")}</span>
        </div>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            {t("addProject")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`} className="block group">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    </div>
                    <Badge variant={statusVariant[project.status] || "default"}>{statusMap[project.status] || project.status}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-indigo-400 transition-colors">{project.name}</CardTitle>
                  <CardDescription>{project.description || t("noDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">{project.type}</Badge>
                    <Badge variant="outline">{project.tech}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500">{t("progress")}</span>
                    <span className="text-sm font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </CardContent>
                <CardFooter>
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                    {project.tasks?.length || 0} {t("tasks")}
                  </span>
                  <span>{project.createdAt}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("addProjectTitle")}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("projectName")}</label>
            <Input value={newProj.name} onChange={(e: any) => setNewProj({ ...newProj, name: e.target.value })} placeholder={t("projectName")} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("description")}</label>
            <Textarea value={newProj.description} onChange={(e: any) => setNewProj({ ...newProj, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">{t("type")}</label>
              <Select value={newProj.type} onChange={(e: any) => setNewProj({ ...newProj, type: e.target.value })}>
                <option>Chrome Extension</option>
                <option>macOS Desktop App</option>
                <option>Shell Script</option>
                <option>Full-Stack Web App</option>
                <option>Other</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">{t("tech")}</label>
              <Input value={newProj.tech} onChange={(e: any) => setNewProj({ ...newProj, tech: e.target.value })} placeholder="Vue 3, Swift..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t("cancel")}</Button>
            <Button variant="primary" onClick={handleAdd}>{t("add")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
