# SmartStudy AI · Frontend PRD

## Original Problem Statement
Modern web dashboard UI for "SmartStudy AI" — a student productivity platform consuming a NestJS REST API. Built with React + Tailwind. Sections: Dashboard, Tareas, Planes de Estudio, Resultados (análisis de riesgo). Authentication required (JWT bearer). Spanish UI, dark mode educativo.

## Architecture
- **Stack**: React 18 (CRA) + Tailwind CSS 3 + react-router-dom v6 + axios + lucide-react.
- **Auth**: JWT bearer stored in `localStorage` (`smartstudy_token`, `smartstudy_user`); axios interceptor adds `Authorization: Bearer <token>` and clears storage + redirects to `/login` on 401.
- **API base URL**: `process.env.REACT_APP_API_URL` (default `http://localhost:3000/api` — user's local NestJS).
- **Routing**: `/login`, `/register` (public). `/dashboard`, `/tasks`, `/study-plans`, `/results` protected by `ProtectedRoute`.

## Backend Endpoints Consumed (NestJS)
- `POST /api/auth/login` `{ email, password }` → `{ id, name, email, token }`
- `POST /api/auth/register` `{ name, email, password, availableHoursPerDay }`
- `GET /api/task` (bearer)
- `POST /api/task` (bearer) `{ title, description?, difficulty, estimatedTime, deadline }`
- `PATCH /api/task/:id` (bearer) — partial update inc. `{ status: "Pendiente" | "Terminado" }`
- `DELETE /api/task/:id` (bearer)
- `GET /api/recommendation` (bearer) → `[{ id_recommendation, generated_plan, created_at }]`
- `POST /api/recommendation` (bearer) — generates a new plan via Gemini

## What's Implemented (2026-01)
- Split-screen Login & Register pages (Spanish, dark mode, brand panel + form)
- Protected dashboard layout: sidebar (4 nav items + active accent bar) + sticky glass topnav with user name + avatar + logout dropdown
- **Dashboard**: stat cards (totales, pendientes, completadas, riesgo), upcoming deadlines list, risk widget, latest plan preview
- **Tareas**: full CRUD table with status filter (Todos/Pendiente/Completado), search, dificulty + tiempo + deadline columns, modal for create/edit, toggle status, delete
- **Planes de Estudio**: cards per plan with day-by-day breakdown (Lunes–Domingo bilingual), generate-plan + reload buttons, empty state
- **Resultados**: client-side risk analysis (since backend has no `/results` endpoint) — colored hero card (green/yellow/red) with score, contextual message, metrics, vencidas list, críticas list
- Loading skeletons, empty states, responsive mobile drawer, all interactive elements have `data-testid` attributes
- Custom dark palette: `#0A0D14` bg, `#11151F` cards, `#1E2536` borders, `#00E5FF` cyan accent. Fonts: Outfit (headings) + Manrope (body).

## User Personas
- **Estudiante universitario**: Necesita organizar tareas, generar plan semanal con IA y entender su nivel de riesgo académico.

## Core Requirements (static)
- Spanish UI, dark mode
- 4 sections + auth
- Dark mode educativo, accent cyan
- Responsive (mobile + desktop)
- Card-based layout, skeletons, empty states

## Backlog / Next Action Items
- **P1**: Cuando el usuario despliegue el backend NestJS y configure CORS, validar el flujo end-to-end real (login → tareas → plan → resultados).
- **P1**: Agregar feedback de toast (éxito/error) tras crear/editar/eliminar tareas (actualmente usa `alert()`).
- **P2**: Endpoint `/results` real en el backend NestJS para que el riesgo se calcule del lado servidor (actualmente es derivado client-side).
- **P2**: Selector de fecha custom (Calendar component) en lugar de input nativo `<input type="date">`.
- **P2**: Animación de transición entre páginas (framer-motion ya instalado).
- **P3**: Modo claro opcional con toggle.
- **P3**: Dashboard con gráfico semanal de tareas completadas (chart library).

## Notes
- Backend FastAPI minimal placeholder en `/app/backend` solo para mantener supervisor activo. El frontend NO lo consume; todo apunta al NestJS del usuario via `REACT_APP_API_URL`.
