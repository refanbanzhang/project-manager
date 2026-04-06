"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { fetchProjects, addProject, deleteProject } from "@/lib/api";
import type { Project, NewProject } from "@/lib/types";
import { Modal, ConfirmModal } from "@/components/Modal";
import {
  Card,
  Button,
  Input,
  ProgressBar,
  Chip,
} from "@heroui/react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  target: Project | null;
  t: (key: string) => string;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, target, t }: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="确认删除"
      message={`确定要删除项目 <strong class="text-[var(--text-primary)] font-medium">${target?.name}</strong> 吗？<br/><span class="text-[var(--danger)]">此操作不可撤销</span>`}
      confirmText={t("delete")}
      cancelText={t("cancel")}
      danger
    />
  );
}

interface AddProjectFormProps {
  newProj: NewProject;
  setNewProj: (p: NewProject) => void;
}

const projectTypes = [
  { id: "Chrome Extension", label: "Chrome Extension" },
  { id: "macOS Desktop App", label: "macOS Desktop App" },
  { id: "Shell Script", label: "Shell Script" },
  { id: "Full-Stack Web App", label: "Full-Stack Web App" },
  { id: "Other", label: "Other" },
];

function AddProjectForm({ newProj, setNewProj }: AddProjectFormProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const selectedType = projectTypes.find(p => p.id === newProj.type);
  
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">项目名称</label>
        <Input
          placeholder="项目名称"
          value={newProj.name}
          onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">描述</label>
        <Input
          placeholder="项目描述"
          value={newProj.description}
          onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">类型</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTypeOpen(!typeOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <span className="text-sm text-[var(--text-primary)]">{selectedType?.label}</span>
            <svg className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${typeOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {typeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 py-1 rounded-none border border-[var(--border-primary)] bg-[var(--bg-card)] z-20">
                {projectTypes.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => { setNewProj({ ...newProj, type: type.id }); setTypeOpen(false); }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
                      newProj.type === type.id ? 'bg-[var(--accent-soft)]' : ''
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
        <label className="text-sm font-medium text-[var(--text-secondary)]">技术栈</label>
        <Input
          placeholder="Vue 3, Swift..."
          value={newProj.tech}
          onChange={(e) => setNewProj({ ...newProj, tech: e.target.value })}
        />
      </div>
    </>
  );
}

export default function HomePage() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [newProj, setNewProj] = useState<NewProject>({ 
    id: "", 
    name: "", 
    description: "", 
    type: "Chrome Extension", 
    tech: "" 
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (projects || []).filter((p) => 
      p.name.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) || 
      p.tech?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const stats = useMemo(() => {
    const allTasks = projects.flatMap((p) => p.tasks || []);
    return {
      projects: projects.length,
      tasks: allTasks.length,
      completed: allTasks.filter((t) => t.status === "done").length,
    };
  }, [projects]);

  async function handleAdd() {
    if (!newProj.name.trim()) return;
    const id = newProj.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await addProject({ ...newProj, id });
    setShowModal(false);
    setNewProj({ id: "", name: "", description: "", type: "Chrome Extension", tech: "" });
    load();
  }

  function confirmDelete(project: Project) {
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

  const statusColor: Record<string, "success" | "warning" | "default"> = 
    { active: "success", paused: "warning", completed: "default", archived: "default" } as const;
  const statusMap: Record<string, string> = { 
    active: t("active"), 
    paused: t("paused"), 
    completed: t("completedStatus"), 
    archived: t("archived") 
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] bg-grid">
      <header className="sticky top-0 z-40 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[15px] font-semibold text-[var(--accent)] glow-text font-[family-name:var(--font-heading)]">{t("title")}</Link>
            <div className="hidden md:flex items-center gap-5 text-[13px] text-[var(--text-tertiary)]">
              <span><span className="font-semibold text-[var(--accent)]">{stats.projects}</span> {t("projects")}</span>
              <span><span className="font-semibold text-[var(--accent)]">{stats.tasks}</span> {t("tasks")}</span>
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
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] font-[family-name:var(--font-heading)]">{t("projects")}</h1>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">{filtered.length} / {projects.length}</p>
          </div>
          <div className="flex gap-2.5">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="btn-cyber-primary h-10" size="md" onPress={() => setShowModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {t("addProject")}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="cyber-card rounded-none h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-none bg-[var(--accent-soft)] border border-[var(--accent)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{projects.length === 0 ? "暂无项目" : "无匹配结果"}</h3>
            <p className="mt-1.5 text-[13px] text-[var(--text-tertiary)]">{projects.length === 0 ? "点击下方按钮添加你的第一个项目" : "尝试调整搜索关键词"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div key={project.id} className="group relative">
                <Link href={`/project/${project.id}`} className="block">
                  <Card className="cyber-card cyber-card-hover rounded-none border-[var(--border-primary)] flex flex-col">
                    <Card.Header className="pb-0 pt-5 px-5">
                      <div className="w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[var(--accent)] text-black">
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
                        <span className="text-[13px] font-bold text-[var(--accent)]">{project.progress}%</span>
                      </div>
                      <ProgressBar 
                        value={project.progress} 
                        color="success"
                        size="sm" 
                        className="mb-4"
                      />
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
                    variant="ghost"
                    size="sm"
                    onPress={() => confirmDelete(project)}
                    className="h-8 w-8 min-w-0 bg-[var(--danger-soft)] border border-[var(--danger)]"
                    data-testid="delete-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t("addProjectTitle")}
        footer={
          <>
            <Button variant="ghost" onPress={() => setShowModal(false)}>{t("cancel")}</Button>
            <Button className="btn-cyber-primary" onPress={handleAdd} isDisabled={!newProj.name.trim()}>{t("add")}</Button>
          </>
        }
      >
        <AddProjectForm newProj={newProj} setNewProj={setNewProj} />
      </Modal>

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
