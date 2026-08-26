import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';

const initial = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const [form, setForm] = useState(initial);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    await addTask(form);
    setForm(initial);
  };

  return (
    <form className="task-form panel" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">NEW WORK ITEM</span>
          <h2>Buat task baru</h2>
        </div>
        <span className="shortcut">CTRL + ENTER</span>
      </div>

      <label>
        Judul task
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Contoh: Deploy aplikasi ke Oracle Cloud"
          required
        />
      </label>

      <label>
        Deskripsi
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Tambahkan konteks singkat..."
          rows="3"
        />
      </label>

      <div className="form-grid">
        <label>
          Prioritas
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Deadline
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </label>
      </div>

      <button className="primary-button" type="submit">+ Tambahkan Task</button>
    </form>
  );
}
