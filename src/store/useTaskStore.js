import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
};

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'all',
      search: '',
      theme: 'dark',
      loading: false,
      lastSync: null,
      pendingOperations: [],
      syncState: 'idle',
      error: null,

      setFilter: (filter) => set({ filter }),
      setSearch: (search) => set({ search }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      clearError: () => set({ error: null }),

      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const tasks = await api('/api/tasks');
          set({ tasks, loading: false, lastSync: new Date().toISOString() });
          await get().syncPending();
        } catch (error) {
          set({ loading: false, error: 'Server tidak dapat dijangkau. Data lokal tetap tersedia.' });
        }
      },

      addTask: async (input) => {
        const task = {
          id: uid(),
          title: input.title.trim(),
          description: input.description.trim(),
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          dueDate: input.dueDate || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({ tasks: [task, ...state.tasks], error: null }));
        try {
          const saved = await api('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
          set((state) => ({
            tasks: state.tasks.map((item) => (item.id === task.id ? saved : item)),
            lastSync: new Date().toISOString()
          }));
        } catch {
          get().enqueue({ type: 'create', task });
        }
      },

      updateTask: async (id, changes) => {
        const current = get().tasks.find((task) => task.id === id);
        if (!current) return;
        const updated = { ...current, ...changes, updatedAt: new Date().toISOString() };
        set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? updated : task)), error: null }));

        try {
          const saved = await api(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updated) });
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? saved : task)),
            lastSync: new Date().toISOString()
          }));
        } catch {
          get().enqueue({ type: 'update', task: updated });
        }
      },

      deleteTask: async (id) => {
        const current = get().tasks.find((task) => task.id === id);
        if (!current) return;
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id), error: null }));

        try {
          await api(`/api/tasks/${id}`, { method: 'DELETE' });
          set({ lastSync: new Date().toISOString() });
        } catch {
          get().enqueue({ type: 'delete', task: current });
        }
      },

      enqueue: (operation) => set((state) => ({
        pendingOperations: [...state.pendingOperations, { ...operation, queuedAt: new Date().toISOString() }],
        syncState: 'pending',
        error: 'Perubahan disimpan secara lokal dan menunggu sinkronisasi.'
      })),

      syncPending: async () => {
        const queue = [...get().pendingOperations];
        if (!queue.length || !navigator.onLine) return;
        set({ syncState: 'syncing', error: null });

        const failed = [];
        for (const operation of queue) {
          try {
            if (operation.type === 'create') {
              await api('/api/tasks', { method: 'POST', body: JSON.stringify(operation.task) });
            } else if (operation.type === 'update') {
              await api(`/api/tasks/${operation.task.id}`, { method: 'PUT', body: JSON.stringify(operation.task) });
            } else if (operation.type === 'delete') {
              await api(`/api/tasks/${operation.task.id}`, { method: 'DELETE' });
            }
          } catch {
            failed.push(operation);
          }
        }

        set({
          pendingOperations: failed,
          syncState: failed.length ? 'pending' : 'idle',
          lastSync: failed.length ? get().lastSync : new Date().toISOString(),
          error: failed.length ? 'Sebagian perubahan masih menunggu sinkronisasi.' : null
        });

        if (!failed.length) {
          try {
            const tasks = await api('/api/tasks');
            set({ tasks });
          } catch {
            // Keep local state if refresh fails after a successful queue flush.
          }
        }
      }
    }),
    {
      name: 'cloudtask-state',
      partialize: (state) => ({
        tasks: state.tasks,
        filter: state.filter,
        search: state.search,
        theme: state.theme,
        lastSync: state.lastSync,
        pendingOperations: state.pendingOperations,
        syncState: state.syncState
      })
    }
  )
);
