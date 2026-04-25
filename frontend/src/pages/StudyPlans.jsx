import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { Button, Badge, Skeleton, EmptyState, Card } from '../components/ui/Primitives';
import { formatDate, formatDay } from '../lib/utils';

function PlanCard({ plan }) {
  const days = plan?.generated_plan?.plan || plan?.generated_plan || [];
  const list = Array.isArray(days) ? days : [];

  return (
    <Card className="hover:-translate-y-0.5 hover:border-accent/40">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Badge tone="accent" className="mb-3">Plan #{plan.id_recommendation}</Badge>
          <h3 className="font-heading text-xl font-semibold">Plan de estudio personalizado</h3>
          <p className="text-xs text-ink-muted mt-1 inline-flex items-center gap-1.5">
            <Calendar size={12} /> Generado el {formatDate(plan.created_at)}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-ink-secondary text-sm">Este plan no tiene días definidos.</p>
      ) : (
        <div className="space-y-3">
          {list.map((d, i) => {
            const tasks = d.tasks || d.tareas || [];
            return (
              <div key={i} className="border border-line rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
                    {formatDay(d.day || d.dia || `Día ${i + 1}`)}
                  </p>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider">{tasks.length} tareas</span>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-sm text-ink-muted italic">Día libre · descanso recomendado</p>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map((t, j) => {
                      const title = typeof t === 'string' ? t : (t.title || t.task || t.name || JSON.stringify(t));
                      const time = typeof t === 'object' ? (t.estimatedTime || t.duration || t.minutes) : null;
                      return (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white">{title}</p>
                            {time ? <p className="text-xs text-ink-muted mt-0.5">{time} min</p> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/recommendation');
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar los planes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    setGenError('');
    try {
      await api.post('/recommendation');
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo generar el plan.';
      setGenError(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div data-testid="plans-page" className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Planes de estudio</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight mt-2">Plan semanal con IA</h1>
          <p className="text-ink-secondary mt-2 max-w-2xl">
            Cada plan se construye en base a tus tareas activas, dificultad y tiempo disponible.
            Genera nuevos planes cuando tu agenda cambie.
          </p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="refresh-plans-btn" variant="secondary" onClick={load}>
            <RefreshCw size={16} /> Recargar
          </Button>
          <Button data-testid="generate-plan-btn" onClick={generate} disabled={generating}>
            <Sparkles size={16} /> {generating ? 'Generando…' : 'Generar plan'}
          </Button>
        </div>
      </div>

      {genError && (
        <div className="p-3 rounded-md border border-bad/30 bg-bad/10 text-sm text-bad flex items-center gap-2">
          <AlertTriangle size={16} /> {genError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : error ? (
        <div className="surface-card text-bad text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aún no has generado planes"
            description="Necesitas al menos una tarea activa. Genera tu primer plan de estudio asistido por IA."
            testid="empty-plans"
            action={<Button onClick={generate} disabled={generating}><Sparkles size={16} /> {generating ? 'Generando…' : 'Generar mi primer plan'}</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((p) => <PlanCard key={p.id_recommendation} plan={p} />)}
        </div>
      )}
    </div>
  );
}
