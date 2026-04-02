import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'data.json');

const app = express();
app.use(cors());
app.use(express.json());

function readData() {
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 获取所有项目
app.get('/api/projects', (req, res) => {
  const data = readData();
  res.json(data.projects);
});

// 获取单个项目
app.get('/api/projects/:id', (req, res) => {
  const data = readData();
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// 更新项目
app.put('/api/projects/:id', (req, res) => {
  const data = readData();
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  data.projects[index] = { ...data.projects[index], ...req.body };
  writeData(data);
  res.json(data.projects[index]);
});

// 添加任务
app.post('/api/projects/:id/tasks', (req, res) => {
  const data = readData();
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const task = {
    id: `task_${Date.now()}`,
    title: req.body.title,
    status: req.body.status || 'todo',
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    completedAt: null,
    ...req.body
  };
  project.tasks.push(task);
  writeData(data);
  res.json(task);
});

// 更新任务
app.put('/api/projects/:id/tasks/:taskId', (req, res) => {
  const data = readData();
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const task = project.tasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  Object.assign(task, req.body);
  if (req.body.status === 'done' && !task.completedAt) {
    task.completedAt = new Date().toISOString().split('T')[0];
  }
  writeData(data);
  res.json(task);
});

// 删除任务
app.delete('/api/projects/:id/tasks/:taskId', (req, res) => {
  const data = readData();
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  project.tasks = project.tasks.filter(t => t.id !== req.params.taskId);
  writeData(data);
  res.json({ success: true });
});

// 添加新项目
app.post('/api/projects', (req, res) => {
  const data = readData();
  const project = {
    id: req.body.id || `project_${Date.now()}`,
    name: req.body.name,
    description: req.body.description || '',
    type: req.body.type || 'Other',
    tech: req.body.tech || '',
    status: req.body.status || 'active',
    progress: req.body.progress || 0,
    createdAt: new Date().toISOString().split('T')[0],
    tasks: [],
    ...req.body
  };
  data.projects.push(project);
  writeData(data);
  res.json(project);
});

// 删除项目
app.delete('/api/projects/:id', (req, res) => {
  const data = readData();
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  data.projects.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(findAvailablePort(startPort + 1)));
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

const PORT = await findAvailablePort(30000 + Math.floor(Math.random() * 30000));
writeFileSync(join(__dirname, '.port'), String(PORT));
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
