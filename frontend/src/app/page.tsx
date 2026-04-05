"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { fetchProjects, addProject, deleteProject } from "@/lib/api";
import {
  Card,
  Button,
  Input,
  TextArea,
  ProgressBar,
  Chip,
} from "@heroui/react";

function AddProjectModal({ isOpen, onClose, onAdd, newProj, setNewProj, t }: any) {
  if (!isOpen) return null;
  
  const projectTypes = [
    { id: "Chrome Extension", label: "Chrome Extension" },
    { id: "macOS Desktop App", label: "macOS Desktop App" },
    { id: "Shell Script", label: "Shell Script" },
    { id: "Full-Stack Web App", label: "Full-Stack Web App" },
    { id: "Other", label: "Other" },
  ];
  
  const [typeOpen, setTypeOpen] = useState(false);
  const selectedType = projectTypes.find(p => p.id === newProj.type);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("addProjectTitle")}</h2>
          <Button isIconOnly variant="light" size="sm" onPress={onClose} className="text-[var(--text-tertiary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("projectName")}</label>
            <Input
              placeholder={t("projectName")}
              value={newProj.name}
              onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
              className="bg-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("description")}</label>
            <TextArea
              placeholder={t("description")}
              value={newProj.description}
              onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
              rows={2}
              className="bg-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("type")}</label>
            <div className="relative">
              <button
                onClick={() => setTypeOpen(!typeOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <span className="text-sm text-[var(--text-primary)]">{selectedType?.label}</span>
                <svg className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${typeOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {typeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg z-20">
                    {projectTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => { setNewProj({ ...newProj, type: type.id }); setTypeOpen(false); }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                          newProj.type === type.id ? 'bg-[var(--bg-secondary)]' : ''
                        }`}
                      >
                        <span className="text-[var(--text-primary)]">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">{t("tech")}</label>
            <Input
              placeholder="Vue 3, Swift..."
              value={newProj.tech}
              onChange={(e) => setNewProj({ ...newProj, tech: e.target.value })}
              className="bg-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <Button variant="light" onPress={onClose}>{t("cancel")}</Button>
          <Button variant="primary" onClick={onAdd} isDisabled={!newProj.name.trim()}>{t("add")}</Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, target, t }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center p-8 text-center gap-3">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger-soft)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            确定要删除项目 <strong className="text-[var(--text-primary)] font-medium">{target?.name}</strong> 吗？<br/>
            <span className="text-[var(--text-tertiary)]">此操作不可撤销</span>
          </p>
        </div>
        <div className="flex justify-center gap-3 px-8 pb-8 pt-2">
          <Button variant="light" className="flex-1" onPress={onClose}>{t("cancel")}</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>{t("delete")}</Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
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

  function confirmDelete(project: any) {
    setDeleteTarget(project);
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    if (deleteTarget) {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      setShowDeleteModal(false);
      load();
    }
  }

  const statusColor: any = { active: "primary", paused: "warning", completed: "success", archived: "default" };
  const statusMap: any = { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };

  return (
    <div className="min-h-dvh bg-[var(--bg-secondary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[15px] font-semibold text-[var(--text-primary)]">{t("title")}</Link>
            <div className="hidden md:flex items-center gap-5 text-[13px] text-[var(--text-tertiary)]">
              <span><span className="font-semibold text-[var(--text-primary)]">{stats.projects}</span> {t("projects")}</span>
              <span><span className="font-semibold text-[var(--text-primary)]">{stats.tasks}</span> {t("tasks")}</span>
              <span><span className="font-semibold text-[var(--success)]">{stats.completed}</span> {t("completed")}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setLang(lang === "zh" ? "en" : "zh")}
              className="h-8 min-w-0 px-2 text-[13px] font-medium text-[var(--text-secondary)]"
            >
              {lang === "zh" ? "EN" : "中文"}
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={toggleTheme}
              className="h-8 w-8 min-w-0 text-[var(--text-secondary)]"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{t("projects")}</h1>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">{filtered.length} / {projects.length}</p>
          </div>
          <div className="flex gap-2.5">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Button variant="primary" size="md" onPress={() => setShowModal(true)} className="h-10">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {t("addProject")}
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{projects.length === 0 ? "暂无项目" : "无匹配结果"}</h3>
            <p className="mt-1.5 text-[13px] text-[var(--text-tertiary)]">{projects.length === 0 ? "点击下方按钮添加你的第一个项目" : "尝试调整搜索关键词"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div key={project.id} className="group relative">
                <Link href={`/project/${project.id}`} className="block">
                  <Card className="card-hover cursor-pointer border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col">
                    <Card.Header className="pb-0 pt-5 px-5">
                      <div className="w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-[15px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Chip size="sm" color={statusColor[project.status] || "default"} variant="soft" className="text-[11px]">
                                  {statusMap[project.status] || project.status}
                                </Chip>
                                <span className="text-[12px] text-[var(--text-tertiary)]">{project.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 min-h-[40px]">
                          {(project.description || project.summary) ? (
                            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">{project.description || project.summary}</p>
                          ) : (
                            <div className="h-[40px]" />
                          )}
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Content className="px-5 pt-4 pb-5 mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-medium text-[var(--text-tertiary)]">{t("progress")}</span>
                        <span className="text-[13px] font-bold text-[var(--text-primary)]">{project.progress}%</span>
                      </div>
                      <ProgressBar value={project.progress} color="accent" size="sm" className="mb-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                          {project.tasks?.length || 0} {t("tasks")}
                        </div>
                        <span className="text-[12px] text-[var(--text-tertiary)]">{project.createdAt}</span>
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    isIconOnly
                    variant="danger"
                    size="sm"
                    onPress={() => confirmDelete(project)}
                    className="h-8 w-8 min-w-0"
                    data-testid="delete-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
        newProj={newProj}
        setNewProj={setNewProj}
        t={t}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        target={deleteTarget}
        t={t}
      />
    </div>
  );
}
