import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Label } from '../components/ui/Primitives';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo iniciar sesión.';
      setError(Array.isArray(msg) ? msg.join(' · ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual side */}
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
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Productividad académica</p>
          <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
            Tu plan de estudio,<br />asistido por IA.
          </h1>
          <p className="text-ink-secondary leading-relaxed">
            Organiza tareas, genera planes semanales personalizados y anticipa el riesgo
            de no cumplir tus objetivos académicos.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-bg">
              <Sparkles size={18} strokeWidth={2.4} />
            </div>
            <p className="font-heading text-xl font-bold">SmartStudy<span className="text-accent">.</span>AI</p>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Iniciar sesión</p>
          <h2 className="font-heading text-3xl font-bold mb-2">Bienvenido de vuelta</h2>
          <p className="text-ink-secondary mb-10">Accede para ver tus tareas, planes de estudio y análisis de riesgo.</p>

          {error && (
            <div data-testid="login-error" className="mb-6 flex items-start gap-2 p-3 rounded-md border border-bad/30 bg-bad/10 text-sm text-bad">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  data-testid="login-email-input"
                  id="email" name="email" type="email" autoComplete="email" required
                  value={form.email} onChange={onChange}
                  placeholder="tu@correo.com" className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  data-testid="login-password-input"
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={form.password} onChange={onChange}
                  placeholder="••••••" className="pl-10"
                />
              </div>
            </div>

            <Button data-testid="login-submit-btn" type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Ingresando…' : 'Entrar a SmartStudy'}
            </Button>
          </form>

          <p className="text-sm text-ink-secondary mt-8 text-center">
            ¿No tienes cuenta?{' '}
            <Link data-testid="go-register-link" to="/register" className="text-accent font-medium hover:text-accent-hover">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
