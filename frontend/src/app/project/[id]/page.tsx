"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/components/providers";
import { fetchProject, updateProject, addTask, updateTask, deleteTask } from "@/lib/api";
import {
  Button,
  Select,
  ListBox,
  Label,
  Modal,
  ProgressBar,
  Chip,
  Card,
  Input,
  TextField,
  Slider,
  Checkbox,
} from "@heroui/react";

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
  const priorityColor: any = { high: "danger", medium: "warning", low: "success" };
  const statusMap: any = { active: t("active"), paused: t("paused"), completed: t("completedStatus"), archived: t("archived") };

  const sortedTasks = project?.tasks
    ? [...project.tasks].sort((a: any, b: any) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const po: any = { high: 0, medium: 1, low: 2 };
        return (po[a.priority] || 1) - (po[b.priority] || 1);
      })
    : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-foreground-500">{t("loading")}</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-foreground-500">Not found</div>;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-4 left-4 right-4 z-50 flex items-center justify-between h-16 px-6 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-foreground-500 hover:text-foreground transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          {t("back")}
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setLang(lang === "zh" ? "en" : "zh")}
            className="font-semibold"
          >
            {lang === "zh" ? "EN" : "中文"}
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={toggleTheme}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
            <p className="text-foreground-500">{project.description || t("noDescription")}</p>
          </div>
          <Select
            selectedKey={localStatus}
            onSelectionChange={(key) => handleStatusChange(String(key || ""))}
            className="w-40"
          >
            <ListBox>
              <ListBox.Item id="active">{t("active")}</ListBox.Item>
              <ListBox.Item id="paused">{t("paused")}</ListBox.Item>
              <ListBox.Item id="completed">{t("completedStatus")}</ListBox.Item>
              <ListBox.Item id="archived">{t("archived")}</ListBox.Item>
            </ListBox>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <Card.Content>
              <div className="text-xs text-foreground-400 uppercase tracking-wider mb-2">{t("type")}</div>
              <div className="font-semibold">{project.type}</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <div className="text-xs text-foreground-400 uppercase tracking-wider mb-2">{t("tech")}</div>
              <div className="font-semibold">{project.tech}</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-foreground-400 uppercase tracking-wider">{t("progress")}</span>
                <span className="text-xl font-bold text-primary">{localProgress}%</span>
              </div>
              <Slider
                step={1}
                minValue={0}
                maxValue={100}
                value={localProgress}
                onChange={(value) => handleProgressChange(Number(value))}
                className="w-full"
              />
            </Card.Content>
          </Card>
        </div>

        <Card>
          <Card.Content className="p-0">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">{t("taskList")} ({project.tasks?.length || 0})</h2>
              <Button variant="primary" size="sm" onPress={() => setShowTaskModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                {t("addTask")}
              </Button>
            </div>

            <div className="p-2">
              {sortedTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-default-100 ${task.status === "done" ? "opacity-50" : ""}`}
                >
                  <Checkbox
                    isSelected={task.status === "done"}
                    onChange={() => toggleTask(task)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.status === "done" ? "line-through text-foreground-400" : ""}`}>{task.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <Chip size="sm" color={priorityColor[task.priority] || "default"} variant="soft">{priorityLabel[task.priority]}</Chip>
                      <span className="text-xs text-foreground-400">{task.createdAt}</span>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    variant="danger"
                    size="sm"
                    onPress={() => removeTask(task)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Button>
                </div>
              ))}

              {!sortedTasks.length && (
                <div className="text-center py-16 text-foreground-400">
                  <p className="text-sm mb-1">{t("noTasks")}</p>
                  <p className="text-xs opacity-70">{t("noTasksSub")}</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </main>

      <Modal>
        <Modal.Backdrop isOpen={showTaskModal} onOpenChange={setShowTaskModal}>
          <Modal.Container placement="center" size="md">
            <Modal.Dialog>
              <Modal.Header>{t("addTaskTitle")}</Modal.Header>
              <Modal.Body>
                <TextField>
                  <Label>{t("taskTitle")}</Label>
                  <Input
                    placeholder={t("taskTitle")}
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    fullWidth
                  />
                </TextField>
                <Select
                  selectedKey={newTask.priority}
                  onSelectionChange={(key) => setNewTask({ ...newTask, priority: String(key || "") })}
                  fullWidth
                >
                  <Label>{t("priority")}</Label>
                  <ListBox>
                    <ListBox.Item id="high">{t("high")}</ListBox.Item>
                    <ListBox.Item id="medium">{t("medium")}</ListBox.Item>
                    <ListBox.Item id="low">{t("low")}</ListBox.Item>
                  </ListBox>
                </Select>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" slot="close">{t("cancel")}</Button>
                <Button variant="primary" onPress={() => { handleAddTask(); }}>{t("add")}</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
