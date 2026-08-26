import { useEffect, useMemo, useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskCard from './components/TaskCard.jsx';
import { useTaskStore } from './store/useTaskStore.js';

export default function App() {
  const {
    tasks, filter, search, theme, loading, lastSync, pendingOperations, syncState, error,
    setFilter, setSearch, toggleTheme, fetchTasks, syncPending, clearError
  } = useTaskStore();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      syncPending();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncPending]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length
  }), [tasks]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = !q || `${task.title} ${task.description}`.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">CT</div>
          <div><strong>CloudTask</strong><span>Cloud Work Management</span></div>
        </div>
        <div className="top-actions">
          <span className={`connection ${online ? 'online' : 'offline'}`}>
            <i /> {online ? 'Cloud Connected' : 'Offline Mode'}
          </span>
          <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">DEPLOYMENT READY / STATE PERSISTED</span>
            <h1>Kelola pekerjaan.<br /><em>Sinkronkan ke cloud.</em></h1>
            <p>Task management dengan client-side state, offline queue, REST API, health monitoring, dan pipeline CI/CD.</p>
          </div>
          <div className="hero-status panel">
            <span>APPLICATION STATUS</span>
            <strong>{online ? 'Operational' : 'Local-first'}</strong>
            <small>{pendingOperations.length} operasi menunggu sinkronisasi</small>
            <button onClick={syncPending} disabled={!online || !pendingOperations.length || syncState === 'syncing'}>
              {syncState === 'syncing' ? 'Menyinkronkan...' : 'Sync sekarang'}
            </button>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat"><span>Total Task</span><strong>{stats.total}</strong><small>Semua pekerjaan</small></div>
          <div className="stat"><span>To Do</span><strong>{stats.todo}</strong><small>Belum dimulai</small></div>
          <div className="stat"><span>In Progress</span><strong>{stats.doing}</strong><small>Sedang dikerjakan</small></div>
          <div className="stat"><span>Done</span><strong>{stats.done}</strong><small>Selesai</small></div>
        </section>

        {error && <div className="notice" onClick={clearError}>{error}<span>×</span></div>}

        <section className="workspace">
          <TaskForm />
          <div className="task-area panel">
            <div className="section-heading list-heading">
              <div>
                <span className="eyebrow">WORKSPACE</span>
                <h2>Daftar task</h2>
              </div>
              <small>Last sync: {lastSync ? new Date(lastSync).toLocaleString('id-ID') : 'belum ada'}</small>
            </div>

            <div className="toolbar">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari task..." />
              <div className="filters">
                {['all', 'todo', 'doing', 'done'].map((item) => (
                  <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
                    {item === 'all' ? 'Semua' : item === 'todo' ? 'To Do' : item === 'doing' ? 'In Progress' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-list">
              {loading && !tasks.length ? <div className="empty">Memuat data dari cloud...</div> : null}
              {!loading && !visible.length ? <div className="empty">Belum ada task yang sesuai filter.</div> : null}
              {visible.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>CloudTask v1.0</span>
        <span>React · Zustand · Express · Nginx · PM2 · GitHub Actions</span>
      </footer>
    </div>
  );
}
