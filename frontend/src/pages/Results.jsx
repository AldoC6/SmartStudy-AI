import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, AlertTriangle, Activity, Clock, Flame, Target } from 'lucide-react';
import api from '../lib/api';
import { Skeleton, Badge } from '../components/ui/Primitives';
import { computeRiskFromTasks, formatDate, daysUntil } from '../lib/utils';

const TONES = {
  bajo: {
    bg: 'rgba(0, 230, 118, 0.08)',
    border: 'rgba(0, 230, 118, 0.35)',
    color: '#00E676',
    glow: '0 0 60px -20px rgba(0, 230, 118, 0.55)',
  },
  medio: {
    bg: 'rgba(255, 234, 0, 0.08)',
    border: 'rgba(255, 234, 0, 0.4)',
    color: '#FFEA00',
    glow: '0 0 60px -20px rgba(255, 234, 0, 0.55)',
  },
  alto: {
    bg: 'rgba(255, 77, 77, 0.08)',
    border: 'rgba(255, 77, 77, 0.4)',
    color: '#FF4D4D',
    glow: '0 0 60px -20px rgba(255, 77, 77, 0.6)',
  },
};

function MetricBox({ icon: Icon, label, value, hint, tone = 'secondary' }) {
  const toneClasses = {
    secondary: 'text-ink-secondary',
    accent: 'text-accent',
    bad: 'text-bad',
    warn: 'text-warn',
    good: 'text-good',
  };
  return (
    <div className="border border-line rounded-md p-4 bg-bg-card">
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">{label}</p>
        <Icon size={14} className={toneClasses[tone]} />
      </div>
      <p className="font-heading text-2xl font-bold mt-3">{value}</p>
      {hint ? <p className="text-xs text-ink-muted mt-1">{hint}</p> : null}
    </div>
  );
}

export default function Results() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // The backend doesn't expose a /results endpoint — we derive risk from /task.
        const { data } = await api.get('/task');
        if (!mounted) return;
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar los resultados.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const risk = useMemo(() => computeRiskFromTasks(tasks), [tasks]);
  const tone = TONES[risk.level];

  const overdueTasks = useMemo(() => tasks
    .filter((t) => t.status !== 'Terminado' && t.status !== 'Completado')
    .filter((t) => {
      const r = daysUntil(t.deadline);
      return r !== null && r < 0;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)), [tasks]);

  const criticalTasks = useMemo(() => tasks
    .filter((t) => t.status !== 'Terminado' && t.status !== 'Completado')
    .filter((t) => {
      const r = daysUntil(t.deadline);
      return r !== null && r >= 0 && r <= 2 && Number(t.difficulty || 0) >= 7;
    }), [tasks]);

  return (
    <div data-testid="results-page" className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Resultados</p>
        <h1 className="font-heading text-4xl font-bold tracking-tight mt-2">Análisis de riesgo</h1>
        <p className="text-ink-secondary mt-2 max-w-2xl">
          Evaluación calculada a partir de tus tareas pendientes, vencimientos y dificultad.
        </p>
      </div>

      {error && (
        <div className="surface-card text-bad text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Risk hero card */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div
          data-testid="risk-card"
          className="rounded-xl p-8 md:p-10 border transition-all"
          style={{
            backgroundColor: tone.bg,
            borderColor: tone.border,
            boxShadow: tone.glow,
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-md flex items-center justify-center border"
              style={{ borderColor: tone.border, color: tone.color }}
            >
              <ShieldAlert size={26} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: tone.color }}>Nivel actual</p>
              <h2
                data-testid="risk-level"
                className="font-heading text-4xl md:text-5xl font-bold mt-1"
                style={{ color: tone.color }}
              >
                {risk.label}
              </h2>
            </div>
          </div>
          <p className="text-ink-secondary text-lg max-w-3xl leading-relaxed">{risk.message}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <MetricBox icon={Activity} label="Score" value={risk.score} hint="Mayor = más riesgo" tone="accent" />
            <MetricBox icon={Clock} label="Pendientes" value={risk.stats.pending} hint="Tareas sin completar" />
            <MetricBox icon={Flame} label="Vencidas" value={risk.stats.overdue} hint="Tareas con fecha pasada" tone="bad" />
            <MetricBox icon={Target} label="Dif. promedio" value={risk.stats.avgDifficulty} hint="Sobre 10" tone="warn" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue */}
        <div className="surface-card">
          <h3 className="font-heading text-lg font-semibold mb-1">Tareas vencidas</h3>
          <p className="text-xs text-ink-muted mb-4">Atención inmediata</p>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : overdueTasks.length === 0 ? (
            <p className="text-sm text-ink-secondary py-6 text-center">Sin vencidas. Buen ritmo. ✓</p>
          ) : (
            <ul className="divide-y divide-line">
              {overdueTasks.map((t) => {
                const r = daysUntil(t.deadline);
                return (
                  <li key={t.id || t.id_task} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-ink-muted">{formatDate(t.deadline)}</p>
                    </div>
                    <Badge tone="alto">Hace {Math.abs(r)}d</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Critical */}
        <div className="surface-card">
          <h3 className="font-heading text-lg font-semibold mb-1">Críticas a corto plazo</h3>
          <p className="text-xs text-ink-muted mb-4">Alta dificultad y vencen en ≤ 2 días</p>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : criticalTasks.length === 0 ? (
            <p className="text-sm text-ink-secondary py-6 text-center">No hay tareas críticas inminentes.</p>
          ) : (
            <ul className="divide-y divide-line">
              {criticalTasks.map((t) => (
                <li key={t.id || t.id_task} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-xs text-ink-muted">{formatDate(t.deadline)} · Dificultad {t.difficulty}/10</p>
                  </div>
                  <Badge tone="medio">Crítica</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        El nivel de riesgo se calcula localmente a partir de tus tareas (vencimientos, dificultad, volumen).
        El backend NestJS no expone un endpoint <code className="text-accent">/results</code> aún.
      </p>
    </div>
  );
}
