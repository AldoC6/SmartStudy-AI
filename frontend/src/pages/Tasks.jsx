import React, { useEffect, useState } from 'react';
import { Plus, Filter, Search, ListChecks, AlertTriangle, Trash2, Edit3, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../lib/api';
import {
  Button, Badge, Skeleton, EmptyState, Input, Label, Select, Textarea, Modal,
} from '../components/ui/Primitives';
import { formatDate, daysUntil } from '../lib/utils';

function statusTone(s) {
  if (s === 'Terminado' || s === 'Completado') return 'completado';
  return 'pendiente';
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | done
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 5, estimatedTime: 60, deadline: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/task');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', difficulty: 5, estimatedTime: 60, deadline: '' });
    setFormError('');
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title || '',
      description: t.description || '',
      difficulty: t.difficulty || 5,
      estimatedTime: t.estimatedTime || 60,
      deadline: t.deadline ? new Date(t.deadline).toISOString().slice(0, 10) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        difficulty: Number(form.difficulty),
        estimatedTime: Number(form.estimatedTime),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };
      if (editing) {
        const id = editing.id || editing.id_task;
        await api.patch(`/task/${id}`, payload);
      } else {
        await api.post('/task', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al guardar';
      setFormError(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (t) => {
    const id = t.id || t.id_task;
    const next = t.status === 'Terminado' ? 'Pendiente' : 'Terminado';
    try {
      await api.patch(`/task/${id}`, { status: next });
      setTasks((prev) => prev.map((x) => ((x.id || x.id_task) === id ? { ...x, status: next } : x)));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'No se pudo actualizar');
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`¿Eliminar la tarea "${t.title}"?`)) return;
    const id = t.id || t.id_task;
    try {
      await api.delete(`/task/${id}`);
      setTasks((prev) => prev.filter((x) => (x.id || x.id_task) !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'No se pudo eliminar');
    }
  };

  const filtered = tasks
    .filter((t) => {
      if (filter === 'pending') return t.status !== 'Terminado' && t.status !== 'Completado';
      if (filter === 'done') return t.status === 'Terminado' || t.status === 'Completado';
      return true;
    })
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    });

  return (
    <div data-testid="tasks-page" className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Tareas</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight mt-2">Tu lista de tareas</h1>
          <p className="text-ink-secondary mt-2">Crea, prioriza y completa cada actividad académica.</p>
        </div>
        <Button data-testid="new-task-btn" onClick={openCreate}>
          <Plus size={16} /> Nueva tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="surface-card !p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            data-testid="task-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o descripción"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-muted" />
          <Select data-testid="task-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="done">Completado</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="surface-card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0,1,2,3,4].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : error ? (
          <div className="p-6 text-bad text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={tasks.length === 0 ? 'Aún no hay tareas' : 'Sin resultados'}
            description={tasks.length === 0 ? 'Crea tu primera tarea para empezar a planificar tu semana.' : 'Ajusta los filtros o tu búsqueda para encontrar lo que buscas.'}
            testid="empty-tasks"
            action={tasks.length === 0 ? <Button onClick={openCreate}><Plus size={16} /> Nueva tarea</Button> : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table data-testid="tasks-table" className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-ink-muted border-b border-line">
                  <th className="px-6 py-4 font-medium">Título</th>
                  <th className="px-6 py-4 font-medium">Descripción</th>
                  <th className="px-6 py-4 font-medium text-right">Dificultad</th>
                  <th className="px-6 py-4 font-medium text-right">Tiempo (min)</th>
                  <th className="px-6 py-4 font-medium">Fecha límite</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const id = t.id || t.id_task;
                  const remaining = daysUntil(t.deadline);
                  return (
                    <tr key={id} className="border-b border-line last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium">{t.title}</p>
                        {remaining !== null && t.status !== 'Terminado' && t.status !== 'Completado' && (
                          <p className={`text-xs mt-0.5 ${remaining < 0 ? 'text-bad' : remaining <= 2 ? 'text-warn' : 'text-ink-muted'}`}>
                            {remaining < 0 ? `Vencida hace ${Math.abs(remaining)}d` : remaining === 0 ? 'Vence hoy' : `Quedan ${remaining}d`}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-ink-secondary max-w-xs truncate">{t.description || '—'}</td>
                      <td className="px-6 py-4 text-right tabular-nums">{t.difficulty}/10</td>
                      <td className="px-6 py-4 text-right tabular-nums">{t.estimatedTime}</td>
                      <td className="px-6 py-4 text-ink-secondary">{formatDate(t.deadline)}</td>
                      <td className="px-6 py-4">
                        <Badge tone={statusTone(t.status)} data-testid={`task-status-${id}`}>{t.status || 'Pendiente'}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            data-testid={`task-toggle-${id}`}
                            onClick={() => toggleStatus(t)}
                            title={t.status === 'Terminado' ? 'Marcar pendiente' : 'Marcar completada'}
                            className="p-2 rounded-md text-ink-secondary hover:text-good hover:bg-good/10 transition-colors"
                          >
                            {t.status === 'Terminado' ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            data-testid={`task-edit-${id}`}
                            onClick={() => openEdit(t)}
                            title="Editar"
                            className="p-2 rounded-md text-ink-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            data-testid={`task-delete-${id}`}
                            onClick={() => remove(t)}
                            title="Eliminar"
                            className="p-2 rounded-md text-ink-secondary hover:text-bad hover:bg-bad/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar tarea' : 'Nueva tarea'} testid="task-modal">
        <form onSubmit={save} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-md border border-bad/30 bg-bad/10 text-sm text-bad">{formError}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input data-testid="task-title-input" id="title" name="title" value={form.title} onChange={onChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea data-testid="task-description-input" id="description" name="description" value={form.description} onChange={onChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad (1-10)</Label>
              <Input data-testid="task-difficulty-input" id="difficulty" name="difficulty" type="number" min={1} max={10} value={form.difficulty} onChange={onChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Tiempo estimado (min)</Label>
              <Input data-testid="task-time-input" id="estimatedTime" name="estimatedTime" type="number" min={1} value={form.estimatedTime} onChange={onChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha límite</Label>
            <Input data-testid="task-deadline-input" id="deadline" name="deadline" type="date" value={form.deadline} onChange={onChange} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button data-testid="task-save-btn" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
