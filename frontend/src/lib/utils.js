import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DAY_NAMES = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', 'miércoles': 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', 'sábado': 'Sábado', domingo: 'Domingo',
};

export function formatDay(day) {
  if (!day) return '';
  const key = String(day).toLowerCase().trim();
  return DAY_NAMES[key] || day;
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(value);
  }
}

export function daysUntil(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// Compute risk locally from tasks (no /results endpoint exists in backend).
export function computeRiskFromTasks(tasks = []) {
  const pending = tasks.filter((t) => t.status !== 'Terminado' && t.status !== 'Completado');
  if (pending.length === 0) {
    return {
      level: 'bajo',
      label: 'Riesgo bajo',
      score: 0,
      message: 'Vas al día. No hay tareas pendientes que comprometan tus plazos.',
      stats: { pending: 0, overdue: 0, criticalSoon: 0, avgDifficulty: 0 },
    };
  }
  let overdue = 0;
  let criticalSoon = 0;
  let totalDifficulty = 0;
  pending.forEach((t) => {
    totalDifficulty += Number(t.difficulty || 0);
    const remaining = daysUntil(t.deadline);
    if (remaining !== null) {
      if (remaining < 0) overdue += 1;
      else if (remaining <= 2 && Number(t.difficulty || 0) >= 7) criticalSoon += 1;
    }
  });
  const avgDifficulty = totalDifficulty / pending.length;
  let score = 0;
  score += overdue * 3;
  score += criticalSoon * 2;
  score += Math.max(0, avgDifficulty - 5);
  score += pending.length > 8 ? 2 : pending.length > 4 ? 1 : 0;

  let level = 'bajo';
  if (score >= 6) level = 'alto';
  else if (score >= 3) level = 'medio';

  const messages = {
    bajo: 'Tu carga está controlada. Mantén el ritmo y revisa tu plan semanal.',
    medio: 'Hay señales de presión académica. Prioriza tareas con poco tiempo restante.',
    alto: 'Riesgo elevado: tienes tareas vencidas o de alta dificultad muy próximas. Reorganiza tu plan ahora.',
  };

  return {
    level,
    label: level === 'bajo' ? 'Riesgo bajo' : level === 'medio' ? 'Riesgo medio' : 'Riesgo alto',
    score: Math.round(score * 10) / 10,
    message: messages[level],
    stats: {
      pending: pending.length,
      overdue,
      criticalSoon,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
    },
  };
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'U';
}
