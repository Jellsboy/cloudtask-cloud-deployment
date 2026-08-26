import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'tasks.json');
const port = Number(process.env.PORT || 3000);
const startedAt = Date.now();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await access(dataFile);
  } catch {
    await writeFile(dataFile, '[]\n', 'utf8');
  }
}

async function readTasks() {
  await ensureStore();
  const raw = await readFile(dataFile, 'utf8');
  return JSON.parse(raw || '[]');
}

async function saveTasks(tasks) {
  await writeFile(dataFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
}

function validTask(body) {
  return body && typeof body.title === 'string' && body.title.trim().length > 0;
}

app.get('/api/health', async (_req, res) => {
  let store = 'ok';
  try { await readTasks(); } catch { store = 'error'; }
  const healthy = store === 'ok';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    app: process.env.APP_NAME || 'CloudTask',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    store,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tasks', async (_req, res, next) => {
  try {
    const tasks = await readTasks();
    res.json(tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  } catch (error) { next(error); }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    if (!validTask(req.body)) return res.status(400).json({ message: 'Judul task wajib diisi.' });
    const tasks = await readTasks();
    const existing = req.body.id && tasks.find((task) => task.id === req.body.id);
    if (existing) return res.status(200).json(existing);

    const now = new Date().toISOString();
    const task = {
      id: req.body.id || randomUUID(),
      title: req.body.title.trim(),
      description: String(req.body.description || '').trim(),
      status: ['todo', 'doing', 'done'].includes(req.body.status) ? req.body.status : 'todo',
      priority: ['low', 'medium', 'high'].includes(req.body.priority) ? req.body.priority : 'medium',
      dueDate: String(req.body.dueDate || ''),
      createdAt: req.body.createdAt || now,
      updatedAt: now
    };
    tasks.unshift(task);
    await saveTasks(tasks);
    res.status(201).json(task);
  } catch (error) { next(error); }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    if (!validTask(req.body)) return res.status(400).json({ message: 'Judul task wajib diisi.' });
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      // Upsert is intentional so an offline UPDATE can recover after reconnect.
      const now = new Date().toISOString();
      const inserted = { ...req.body, id: req.params.id, createdAt: req.body.createdAt || now, updatedAt: now };
      tasks.unshift(inserted);
      await saveTasks(tasks);
      return res.status(201).json(inserted);
    }

    const updated = {
      ...tasks[index],
      ...req.body,
      id: req.params.id,
      title: req.body.title.trim(),
      updatedAt: new Date().toISOString()
    };
    tasks[index] = updated;
    await saveTasks(tasks);
    res.json(updated);
  } catch (error) { next(error); }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const nextTasks = tasks.filter((task) => task.id !== req.params.id);
    await saveTasks(nextTasks);
    res.status(204).end();
  } catch (error) { next(error); }
});

const dist = path.join(rootDir, 'dist');
app.use(express.static(dist, { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.get('/{*splat}', async (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  try {
    await access(path.join(dist, 'index.html'));
    res.sendFile(path.join(dist, 'index.html'));
  } catch {
    res.status(404).send('Frontend belum dibuild. Jalankan npm run build.');
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan internal pada server.' });
});

await ensureStore();
app.listen(port, '0.0.0.0', () => {
  console.log(`CloudTask running on http://0.0.0.0:${port}`);
});
