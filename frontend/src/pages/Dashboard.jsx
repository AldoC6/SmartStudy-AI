import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListChecks, BookOpen, ShieldAlert, ArrowRight, Sparkles, Clock, AlertTriangle, Target,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Skeleton, EmptyState } from '../components/ui/Primitives';
import { computeRiskFromTasks, formatDate, daysUntil, formatDay } from '../lib/utils';

function StatCard({ label, value, hint, icon: Icon, tone = 'accent' }) {
  const toneClasses = {
    accent: 'text-accent',
    good: 'text-good',
    warn: 'text-warn',
    bad: 'text-bad',
    secondary: 'text-ink-secondary',
  };
  return (
    <div className="surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/30 group">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-secondary">{label}</p>
        <div className={`w-9 h-9 rounded-md border border-line bg-bg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      <p className="font-heading text-4xl font-bold mt-5">{value}</p>
      {hint ? <p className="text-xs text-ink-muted mt-2">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ tasks: null, plans: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [tRes, pRes] = await Promise.allSettled([
        api.get('/task'),
        api.get('/recommendation'),
      ]);
      if (!mounted) return;
      if (tRes.status === 'fulfilled') setTasks(Array.isArray(tRes.value.data) ? tRes.value.data : []);
      else setErrors((e) => ({ ...e, tasks: tRes.reason?.message || 'Error cargando tareas' }));
      if (pRes.status === 'fulfilled') setPlans(Array.isArray(pRes.value.data) ? pRes.value.data : []);
      else setErrors((e) => ({ ...e, plans: pRes.reason?.message || 'Error cargando planes' }));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const risk = useMemo(() => computeRiskFromTasks(tasks), [tasks]);
  const pending = tasks.filter((t) => t.status !== 'Terminado' && t.status !== 'Completado');
  const completed = tasks.filter((t) => t.status === 'Terminado' || t.status === 'Completado');
  const upcoming = [...pending]
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  const latestPlan = plans[0];
  const latestPlanDays = latestPlan?.generated_plan?.plan || latestPlan?.generated_plan || [];

  const riskTone = risk.level === 'alto' ? 'bad' : risk.level === 'medio' ? 'warn' : 'good';

  return (
    <div data-testid="dashboard-page" className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Dashboard</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight mt-2">
            Hola, {user?.name?.split(' ')[0] || 'estudiante'} 👋
          </h1>
          <p className="text-ink-secondary mt-2 max-w-xl">
            Aquí tienes el panorama de tu semana: tareas pendientes, planes generados y nivel de riesgo académico.
          </p>
        </div>
        <Link to="/study-plans">
          <Button data-testid="generate-plan-cta" size="lg">
            <Sparkles size={16} /> Generar nuevo plan
          </Button>
        </Link>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </>
        ) : (
          <>
            <StatCard label="Tareas totales" value={tasks.length} hint="Todas tus tareas registradas" icon={ListChecks} tone="accent" />
            <StatCard label="Pendientes" value={pending.length} hint="Por completar" icon={Clock} tone="secondary" />
            <StatCard label="Completadas" value={completed.length} hint="Buen trabajo" icon={Target} tone="good" />
            <StatCard label={risk.label} value={risk.score} hint="Score de riesgo calculado" icon={ShieldAlert} tone={riskTone} />
          </>
        )}
      </div>

      {/* Main grid: upcoming + risk + latest plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming tasks */}
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-semibold">Próximos plazos</h2>
              <p className="text-xs text-ink-muted mt-1">Las tareas que debes priorizar</p>
            </div>
            <Link to="/tasks" className="text-sm text-accent hover:text-accent-hover inline-flex items-center gap-1" data-testid="view-all-tasks">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2,3].map((i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : errors.tasks ? (
            <div className="text-bad text-sm flex items-center gap-2"><AlertTriangle size={16} /> {errors.tasks}</div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Sin tareas próximas"
              description="Cuando agregues tareas con fechas límite, las verás aquí."
              testid="empty-upcoming"
              action={<Link to="/tasks"><Button variant="secondary">Ir a Tareas</Button></Link>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((t) => {
                const remaining = daysUntil(t.deadline);
                const tone = remaining !== null && remaining < 0 ? 'alto' : remaining !== null && remaining <= 2 ? 'medio' : 'pendiente';
                const remLabel = remaining === null ? '—' : remaining < 0 ? `Vencida hace ${Math.abs(remaining)}d` : remaining === 0 ? 'Hoy' : `En ${remaining}d`;
                return (
                  <li key={t.id || t.id_task} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-ink-muted">{formatDate(t.deadline)} · Dificultad {t.difficulty}/10</p>
                    </div>
                    <Badge tone={tone}>{remLabel}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Risk widget */}
        <div className={`surface-card p-6 border ${
          risk.level === 'alto' ? 'border-bad/30' : risk.level === 'medio' ? 'border-warn/30' : 'border-good/30'
        }`}>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-secondary">Análisis de riesgo</p>
          {loading ? (
            <Skeleton className="h-32 mt-4" />
          ) : (
            <>
              <div className="mt-4 flex items-baseline gap-3">
                <span
                  className="font-heading text-3xl font-bold"
                  style={{ color: risk.level === 'alto' ? '#FF4D4D' : risk.level === 'medio' ? '#FFEA00' : '#00E676' }}
                  data-testid="risk-level-text"
                >
                  {risk.label}
                </span>
              </div>
              <p className="text-sm text-ink-secondary mt-3 leading-relaxed">{risk.message}</p>
              <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                <div className="border border-line rounded-md p-2">
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Pend.</p>
                  <p className="font-semibold">{risk.stats.pending}</p>
                </div>
                <div className="border border-line rounded-md p-2">
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Vencidas</p>
                  <p className="font-semibold text-bad">{risk.stats.overdue}</p>
                </div>
                <div className="border border-line rounded-md p-2">
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Críticas</p>
                  <p className="font-semibold text-warn">{risk.stats.criticalSoon}</p>
                </div>
              </div>
              <Link to="/results">
                <Button variant="secondary" size="sm" className="w-full mt-5">Ver detalles</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Latest plan preview */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl font-semibold">Tu plan más reciente</h2>
            <p className="text-xs text-ink-muted mt-1">Resumen del último plan generado por IA</p>
          </div>
          <Link to="/study-plans" className="text-sm text-accent hover:text-accent-hover inline-flex items-center gap-1">
            Ver planes <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <Skeleton className="h-40" />
        ) : !latestPlan ? (
          <EmptyState
            icon={BookOpen}
            title="Aún no tienes planes"
            description="Genera tu primer plan de estudio basado en tus tareas activas."
            testid="empty-latest-plan"
            action={<Link to="/study-plans"><Button>Generar plan</Button></Link>}
          />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge tone="accent">Plan #{latestPlan.id_recommendation}</Badge>
              <span className="text-xs text-ink-muted">{formatDate(latestPlan.created_at)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Array.isArray(latestPlanDays) ? latestPlanDays : []).slice(0, 6).map((d, i) => (
                <div key={i} className="border border-line rounded-md p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">{formatDay(d.day || d.dia || `Día ${i + 1}`)}</p>
                  <ul className="space-y-1 text-sm text-ink-secondary list-disc list-inside">
                    {(d.tasks || d.tareas || []).slice(0, 3).map((tt, j) => (
                      <li key={j} className="truncate">{typeof tt === 'string' ? tt : tt.title || tt.task || JSON.stringify(tt)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
