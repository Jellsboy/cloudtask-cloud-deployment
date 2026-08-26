import { useTaskStore } from '../store/useTaskStore.js';

const statusLabel = { todo: 'To Do', doing: 'In Progress', done: 'Done' };

export default function TaskCard({ task }) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const advance = () => {
    const next = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
    updateTask(task.id, { status: next });
  };

  return (
    <article className="task-card">
      <div className="task-topline">
        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        <span className={`status status-${task.status}`}>{statusLabel[task.status]}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description || 'Tidak ada deskripsi tambahan.'}</p>
      <div className="task-meta">
        <span>{task.dueDate ? `Deadline ${task.dueDate}` : 'Tanpa deadline'}</span>
        <span>ID {task.id.slice(0, 8)}</span>
      </div>
      <div className="task-actions">
        <button onClick={advance}>{task.status === 'done' ? 'Ulangi' : 'Lanjutkan status'}</button>
        <button className="danger" onClick={() => deleteTask(task.id)}>Hapus</button>
      </div>
    </article>
  );
}
