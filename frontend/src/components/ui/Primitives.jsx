import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
  };
  const variants = {
    primary: 'bg-accent text-bg hover:bg-accent-hover hover:-translate-y-px hover:cyan-glow',
    secondary: 'bg-transparent text-white border border-line hover:bg-line/60',
    ghost: 'bg-transparent text-ink-secondary hover:text-white hover:bg-line/40',
    danger: 'bg-bad/15 text-bad border border-bad/30 hover:bg-bad/25',
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'w-full bg-bg border border-line rounded-md px-4 py-2.5 text-white placeholder:text-ink-muted',
        'focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'w-full bg-bg border border-line rounded-md px-4 py-2.5 text-white placeholder:text-ink-muted',
        'focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none resize-y min-h-[88px]',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className = '', ...props }) {
  return <label className={cn('text-xs uppercase tracking-[0.18em] text-ink-secondary font-medium', className)} {...props} />;
}

export function Badge({ tone = 'default', className = '', children, ...props }) {
  const tones = {
    default: 'bg-line/40 text-ink-secondary border-line',
    pendiente: 'bg-ink-secondary/10 text-ink-secondary border-ink-secondary/20',
    completado: 'bg-good/10 text-good border-good/20',
    bajo: 'bg-good/10 text-good border-good/20',
    medio: 'bg-warn/10 text-warn border-warn/30',
    alto: 'bg-bad/10 text-bad border-bad/30',
    accent: 'bg-accent/10 text-accent border-accent/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={cn('surface-card p-6 transition-all duration-200', className)} {...props}>
      {children}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon: Icon, title, description, action, testid }) {
  return (
    <div data-testid={testid} className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon ? (
        <div className="w-14 h-14 rounded-xl border border-line bg-bg-card flex items-center justify-center text-accent mb-4">
          <Icon size={26} strokeWidth={1.6} />
        </div>
      ) : null}
      <h3 className="font-heading text-xl font-semibold text-white">{title}</h3>
      {description ? <p className="text-ink-secondary mt-2 max-w-md">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={cn(
        'bg-bg border border-line rounded-md px-3 py-2 text-white text-sm',
        'focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none',
        'appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Modal({ open, onClose, title, children, testid }) {
  if (!open) return null;
  return (
    <div
      data-testid={testid}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg surface-card p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
          <button
            data-testid="modal-close-btn"
            onClick={onClose}
            className="text-ink-secondary hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
