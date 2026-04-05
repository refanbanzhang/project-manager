import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, readdirSync, existsSync, lstatSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import net from 'net';
import { execSync } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'data.json');
const PARENT_DIR = resolve(__dirname, '../..');
const CURRENT_PROJECT_NAME = 'project-manager';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function getRemoteRepo(dirPath) {
  try {
    const remote = execSync('git remote get-url origin', { cwd: dirPath, encoding: 'utf-8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
    if (match) return { owner: match[1], repo: match[2] };
  } catch {}
  return null;
}

async function deleteRemoteRepo(owner, repo) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set, skipping remote repo deletion');
    return false;
  }
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const parsed = new URL(url);
    const data = JSON.stringify({});
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'project-manager',
      },
    };
    const req = https.request(options, (res) => {
      if (res.statusCode === 204) resolve(true);
      else {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          console.error(`Failed to delete remote ${owner}/${repo}: ${res.statusCode} ${body}`);
          resolve(false);
        });
      }
    });
    req.on('error', (e) => {
      console.error(`Error deleting remote ${owner}/${repo}:`, e.message);
      resolve(false);
    });
    req.end(data);
  });
}

const app = express();
app.use(cors());
app.use(express.json());

function readData() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { projects: [] };
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function detectProjectInfo(dirPath) {
  const info = { type: 'Other', tech: '', summary: '' };
  const techs = [];

  if (existsSync(join(dirPath, 'package.json'))) {
    try {
      const pkg = JSON.parse(readFileSync(join(dirPath, 'package.json'), 'utf-8'));
      if (pkg.description) info.summary = pkg.description;
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) { techs.push('Next.js'); }
      if (deps.react && !deps.next) { techs.push('React'); }
      if (deps.vue) { techs.push('Vue 3'); }
      if (deps.vite) { techs.push('Vite'); }
      if (deps.express) { techs.push('Express'); }
      if (deps.tailwindcss) { techs.push('Tailwind'); }
      if (deps.electron) { techs.push('Electron'); }
    } catch {}
  }

  if (existsSync(join(dirPath, 'README.md')) && !info.summary) {
    try {
      const readme = readFileSync(join(dirPath, 'README.md'), 'utf-8');
      const lines = readme.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      const firstPara = lines.find(l => l.trim());
      if (firstPara) info.summary = firstPara.trim().slice(0, 120);
    } catch {}
  }

  if (existsSync(join(dirPath, 'requirements.txt')) || existsSync(join(dirPath, 'pyproject.toml'))) {
    techs.push('Python');
  }
  if (existsSync(join(dirPath, 'Cargo.toml'))) techs.push('Rust');
  if (existsSync(join(dirPath, 'go.mod'))) techs.push('Go');
  if (existsSync(join(dirPath, 'Gemfile'))) techs.push('Ruby');
  if (existsSync(join(dirPath, 'pom.xml')) || existsSync(join(dirPath, 'build.gradle'))) techs.push('Java');
  if (existsSync(join(dirPath, '.git'))) {
    if (info.type === 'Other') info.type = 'Git Project';
  }

  info.tech = techs.join(' + ') || 'Unknown';
  return info;
}

function scanProjects() {
  const projects = [];
  const savedData = readData();
  const deletedIds = new Set(savedData.projects.filter(p => p._deleted).map(p => p.id));

  try {
    const entries = readdirSync(PARENT_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === CURRENT_PROJECT_NAME || entry.name.startsWith('.')) continue;
      if (!entry.isDirectory()) continue;
      if (deletedIds.has(entry.name)) continue;

      const fullPath = join(PARENT_DIR, entry.name);
      const saved = savedData.projects.find(p => p.id === entry.name);
      const detected = detectProjectInfo(fullPath);

      projects.push({
        id: entry.name,
        name: entry.name,
        description: saved?.description || '',
        summary: saved?.summary || detected.summary || '',
        type: saved?.type || detected.type,
        tech: saved?.tech || detected.tech,
        status: saved?.status || 'active',
        progress: saved?.progress || 0,
        createdAt: saved?.createdAt || new Date().toISOString().split('T')[0],
        tasks: saved?.tasks || [],
      });
    }
  } catch (err) {
    console.error('Error scanning projects:', err.message);
  }

  return projects;
}

// 获取所有项目
app.get('/api/projects', (req, res) => {
  res.json(scanProjects());
});

// 获取单个项目
app.get('/api/projects/:id', (req, res) => {
  const projects = scanProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// 更新项目
app.put('/api/projects/:id', (req, res) => {
  const data = readData();
  let saved = data.projects.find(p => p.id === req.params.id);
  if (!saved) {
    saved = { id: req.params.id, tasks: [] };
    data.projects.push(saved);
  }
  Object.assign(saved, req.body, { id: req.params.id });
  writeData(data);
  const projects = scanProjects();
  const project = projects.find(p => p.id === req.params.id);
  res.json(project);
});

// 添加任务
app.post('/api/projects/:id/tasks', (req, res) => {
  const data = readData();
  let saved = data.projects.find(p => p.id === req.params.id);
  if (!saved) {
    saved = { id: req.params.id, tasks: [] };
    data.projects.push(saved);
  }
  const task = {
    id: `task_${Date.now()}`,
    title: req.body.title,
    status: req.body.status || 'todo',
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    completedAt: null,
    ...req.body
  };
  saved.tasks.push(task);
  writeData(data);
  res.json(task);
});

// 更新任务
app.put('/api/projects/:id/tasks/:taskId', (req, res) => {
  const data = readData();
  const saved = data.projects.find(p => p.id === req.params.id);
  if (!saved) return res.status(404).json({ error: 'Project not found' });
  const task = saved.tasks.find(t => t.id === req.params.taskId);
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
  const saved = data.projects.find(p => p.id === req.params.id);
  if (!saved) return res.status(404).json({ error: 'Project not found' });
  saved.tasks = saved.tasks.filter(t => t.id !== req.params.taskId);
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
app.delete('/api/projects/:id', async (req, res) => {
  const data = readData();
  const projectPath = join(PARENT_DIR, req.params.id);
  const index = data.projects.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    data.projects.push({ id: req.params.id, tasks: [], _deleted: true });
  } else {
    data.projects.splice(index, 1);
  }
  writeData(data);

  if (existsSync(projectPath)) {
    const remoteRepo = getRemoteRepo(projectPath);
    if (remoteRepo) {
      await deleteRemoteRepo(remoteRepo.owner, remoteRepo.repo);
    }
    try {
      rmSync(projectPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to delete directory ${projectPath}:`, err.message);
      return res.status(500).json({ error: 'Failed to delete project directory', details: err.message });
    }
  }

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
