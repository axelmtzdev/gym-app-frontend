# Changelog

Historial de cambios del proyecto **gym-app-frontend**. Este archivo se usa como contexto persistente del proyecto y debe actualizarse a medida que se agreguen nuevas funcionalidades o cambios relevantes.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

_(sin cambios pendientes)_

## [0.1.0] - 2026-09-09

feat: añadir funciones de gestión de sesiones y autenticación de usuarios

### Añadido
- Estructura base de la aplicación Angular 20 (standalone, zoneless) con `provideZonelessChangeDetection`.
- Enrutamiento (`app.routes.ts`) con guard de autenticación (`authGuard`) y layout compartido (`AppShellComponent`):
  - `/acceso` — pantalla de login/registro, fuera del guard.
  - `/dashboard` — resumen general del usuario (racha, entrenamientos del mes, volumen, recomendaciones).
  - `/rutina` — rutina activa del usuario.
  - `/historial` — historial de ejercicios y progresión.
  - `/entrenamiento/:sesionId` — registro de series durante una sesión de entrenamiento.
  - `/resumen/:sesionId` — resumen de una sesión finalizada.
  - Ruta comodín (`**`) redirige a `/dashboard`.
- Módulo `core`:
  - `guards/auth.guard.ts` — protección de rutas privadas.
  - `interceptors/auth.interceptor.ts` — inyección de token en peticiones HTTP, registrado vía `provideHttpClient(withInterceptors(...))`.
  - `layout/app-shell.component.ts` y `layout/back-button.component.ts` — shell de navegación y botón de regreso reutilizable.
  - `models/api.models.ts` — modelos TypeScript del dominio: `Usuario`, `AuthResponse`, `Rutina`, `RutinaDetalle`, `EjercicioPlan`, `Sesion`, `NuevaSerie`, `ReferenciaEjercicio`, `ResumenSesion`, `DashboardData`, `Ejercicio`, `HistorialEjercicio`.
  - Servicios: `auth.service.ts`, `dashboard.service.ts`, `ejercicios.service.ts`, `rutina.service.ts`, `sesion.service.ts`.
- Módulo `features` (componentes standalone con lazy loading):
  - `acceso` — login/registro de usuario.
  - `dashboard` — panel principal.
  - `rutina` — visualización de rutina activa.
  - `registro` — registro de series/pesos durante el entrenamiento.
  - `resumen` — resumen post-entrenamiento (duración, volumen, RPE promedio, PRs, comparación con sesión anterior).
  - `historial` — histórico de progreso por ejercicio (PR, tendencia, gráfico de puntos).
- Configuración de entornos (`src/environments/environment.ts` y `environment.development.ts`).
- Integración de Tailwind CSS 4 (`@tailwindcss/postcss`, `postcss`) con archivo de configuración `.postcssrc.json`.

### Cambiado
- `angular.json` — ajustes de build/configuración para soportar Tailwind/PostCSS.
- `app.config.ts` — se agregó `provideHttpClient` con interceptor de autenticación y `provideZonelessChangeDetection`.
- `app.html` — reemplazo del template por defecto de Angular por el layout real de la aplicación (uso de `<router-outlet>`).
- `app.ts`, `main.ts`, `index.html` — ajustes menores de bootstrap acordes a la nueva estructura.
- `styles.css` — estilos globales ampliados (integración de Tailwind y estilos base de la app).
- `package.json` / `package-lock.json` — nuevas dependencias (`tailwindcss`, `@tailwindcss/postcss`, `postcss`).

---

## [0.0.0] - Commit inicial (`cc427ae`)
- Proyecto generado con Angular CLI (`ng new`), configuración por defecto.
