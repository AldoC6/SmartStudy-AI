import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Label } from '../components/ui/Primitives';

export default function Register() {
  const { register, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', availableHoursPerDay: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      // If backend doesn't auto-issue token on register, do an explicit login.
      if (!res.token) {
        await login({ email: form.email, password: form.password });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo crear la cuenta.';
      setError(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-end p-12 bg-bg-sidebar border-r border-line overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1766958205141-2d775ea560a1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'luminosity',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-bg">
              <Sparkles size={20} strokeWidth={2.4} />
            </div>
            <p className="font-heading text-2xl font-bold">SmartStudy<span className="text-accent">.</span>AI</p>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Crea tu cuenta</p>
          <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
            Diseña tu semana<br />como un estratega.
          </h1>
          <p className="text-ink-secondary leading-relaxed">
            Conecta tus tareas, define tus horas disponibles y deja que la IA construya
            un plan de estudio realista basado en plazos y dificultad.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-bg">
              <Sparkles size={18} strokeWidth={2.4} />
            </div>
            <p className="font-heading text-xl font-bold">SmartStudy<span className="text-accent">.</span>AI</p>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Registro</p>
          <h2 className="font-heading text-3xl font-bold mb-2">Comienza gratis</h2>
          <p className="text-ink-secondary mb-10">Crea una cuenta para acceder a tareas, planes y resultados.</p>

          {error && (
            <div data-testid="register-error" className="mb-6 flex items-start gap-2 p-3 rounded-md border border-bad/30 bg-bad/10 text-sm text-bad">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                data-testid="register-name-input"
                id="name" name="name" type="text" required
                value={form.name} onChange={onChange}
                placeholder="Aldo Cavazos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                data-testid="register-email-input"
                id="email" name="email" type="email" autoComplete="email" required
                value={form.email} onChange={onChange}
                placeholder="tu@correo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                data-testid="register-password-input"
                id="password" name="password" type="password" autoComplete="new-password" required minLength={6}
                value={form.password} onChange={onChange}
                placeholder="Mínimo 6 caracteres · Mayúscula y número"
              />
              <p className="text-xs text-ink-muted">Debe contener al menos una mayúscula, una minúscula y un número o símbolo.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableHoursPerDay">Horas disponibles al día</Label>
              <Input
                data-testid="register-hours-input"
                id="availableHoursPerDay" name="availableHoursPerDay" type="number" min={1} max={12} required
                value={form.availableHoursPerDay} onChange={onChange}
              />
            </div>

            <Button data-testid="register-submit-btn" type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
            </Button>
          </form>

          <p className="text-sm text-ink-secondary mt-8 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link data-testid="go-login-link" to="/login" className="text-accent font-medium hover:text-accent-hover">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
