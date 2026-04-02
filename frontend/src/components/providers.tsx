"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "zh" | "en";

const messages = {
  zh: {
    title: "项目进度管理",
    projects: "个项目",
    tasks: "个任务",
    completed: "已完成",
    searchPlaceholder: "搜索项目...",
    addProject: "添加项目",
    addProjectTitle: "添加新项目",
    projectName: "项目名称",
    description: "描述",
    type: "类型",
    tech: "技术栈",
    cancel: "取消",
    add: "添加",
    back: "返回",
    progress: "进度",
    taskList: "任务清单",
    addTask: "添加任务",
    addTaskTitle: "添加新任务",
    taskTitle: "任务标题",
    priority: "优先级",
    high: "高",
    medium: "中",
    low: "低",
    active: "进行中",
    paused: "已暂停",
    completedStatus: "已完成",
    archived: "已归档",
    noTasks: "暂无任务",
    noTasksSub: "点击上方按钮添加",
    loading: "加载中...",
    noDescription: "暂无描述",
    delete: "删除",
  },
  en: {
    title: "Project Manager",
    projects: "Projects",
    tasks: "Tasks",
    completed: "Completed",
    searchPlaceholder: "Search projects...",
    addProject: "Add Project",
    addProjectTitle: "Add New Project",
    projectName: "Project Name",
    description: "Description",
    type: "Type",
    tech: "Tech Stack",
    cancel: "Cancel",
    add: "Add",
    back: "Back",
    progress: "Progress",
    taskList: "Tasks",
    addTask: "Add Task",
    addTaskTitle: "Add New Task",
    taskTitle: "Task Title",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    active: "Active",
    paused: "Paused",
    completedStatus: "Completed",
    archived: "Archived",
    noTasks: "No tasks yet",
    noTasksSub: "Click the button above to add one",
    loading: "Loading...",
    noDescription: "No description",
    delete: "Delete",
  },
};

type ContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  theme: string;
  toggleTheme: () => void;
};

const Ctx = createContext<ContextType>({} as ContextType);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const s = localStorage.getItem("pm_lang");
    if (s) setLang(s as Lang);
    const t = localStorage.getItem("pm_theme");
    if (t) setTheme(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("pm_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("pm_theme", theme);
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  const t = (key: string) => messages[lang]?.[key] || key;
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  return (
    <Ctx.Provider value={{ lang, setLang, t, theme, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  return useContext(Ctx);
}
