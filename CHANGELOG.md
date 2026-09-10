# Changelog

Historial de cambios del proyecto **gym-app-frontend**. Este archivo se usa como contexto persistente del proyecto y debe actualizarse a medida que se agreguen nuevas funcionalidades o cambios relevantes.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

_(sin cambios pendientes)_

## [0.3.0] - 2026-09-10

fix: corrige el flujo de series por ejercicio y mejora la experiencia de registro de entrenamiento

### Corregido
- `RegistroComponent` — `terminarDescanso()` avanzaba al siguiente ejercicio después de **cada** serie sin comparar contra `series_objetivo`, por lo que nunca se registraba más de una serie por ejercicio. Ahora solo avanza cuando se completaron todas las series del ejercicio actual.
- `RegistroComponent` — al terminar la última serie del último ejercicio, la app dejaba abierto el formulario para "una serie más" en vez de cerrar el entrenamiento. Se agregó una pantalla de cierre ("¡Entrenamiento completo!") que se muestra automáticamente y lleva al resumen.
- `RegistroComponent.confirmarSalida()` navegaba a la ruta vieja `/rutina` (ya no existe tras el cambio a `/rutinas`); ahora navega a `/rutinas`.
- `RutinaFormComponent` — el botón "Guardar rutina" no se habilitaba si el nombre era el último campo editado: `puedeGuardar` es un `computed()` que solo reacciona a signals, y `nombre` era un campo plano (`ngModel` de dos vías sin signal), por lo que el computed no se re-evaluaba al escribir el nombre. Se convirtió `nombre` en `signal('')`.

### Añadido
- Selector visual de RPE en `RegistroComponent`: barra de rango (`input type="range"`, 0–10) acompañada de una imagen y una etiqueta que cambian según el nivel (`meh` 0–1, `facil` 2–4, `orale` 5, `dificil` 6–8, `estuvo-perro` 9–10), usando las imágenes de `public/assets/rpe-images/`. Reemplaza el input numérico simple.

## [0.2.0] - 2026-09-10

feat: catálogo de ejercicios y gestión de rutinas (crear, editar, elegir entre varias)

### Añadido
- Pantalla `/ejercicios` (`EjerciciosComponent`) — catálogo agrupado por grupo muscular, con formulario compartido (`EjercicioFormComponent`) para crear, editar y desactivar ejercicios (`PATCH activo:false`).
- Pantalla `/rutinas` (`RutinasListaComponent`) — lista de rutinas del usuario (nombre, descripción, chips de grupos, conteo de ejercicios), reemplaza el comportamiento anterior de tomar automáticamente "la primera rutina activa".
- Pantallas `/rutinas/nueva` y `/rutinas/:id/editar` (`RutinaFormComponent`) — un solo componente para crear y editar rutinas:
  - Modo crear: nombre, descripción y grupos (máx. 3) viven en un borrador local; los ejercicios se envían en secuencia al backend recién al guardar.
  - Modo editar: agregar/quitar/reordenar ejercicios y editar series/reps persisten de inmediato contra la API.
  - Selector de ejercicios (picker) embebido como estado interno del mismo componente, filtrado por defecto a los grupos de la rutina, con opción "Ver todos" y acceso directo para crear un ejercicio nuevo sin perder el borrador.
- Quinta pestaña "Ejercicios" en la navegación inferior (`AppShellComponent`); la pestaña "Rutina" ahora apunta a la lista (`/rutinas`) en vez de a una rutina única.
- Métodos nuevos en `RutinasService` (`crear`, `actualizar`, `agregarEjercicio`, `actualizarEjercicio`, `quitarEjercicio`) y `EjerciciosService` (`crear`, `actualizar`, filtro por `grupos` en `listar`).
- Modelos nuevos/ampliados en `api.models.ts`: `Ejercicio` (equipo, activo, creado_en), `Rutina`/`RutinaDetalle` (grupos, total_ejercicios), `EjercicioPlan.id`, payloads de creación/actualización, y la constante `GRUPOS_MUSCULARES`.
- `core/utils/case.util.ts` (`aSnakeCase`) — normaliza a snake_case las respuestas del backend de `/ejercicios` y `/rutinas`, que vienen en camelCase (`grupoMuscular`, `creadoEn`) aunque los payloads de entrada sí esperan snake_case (asimetría confirmada contra el backend real).

### Cambiado
- `RutinaComponent` (detalle) ahora lee `:id` de la ruta en vez de tomar la primera rutina activa; se movió a `/rutinas/:id`, con botón de regreso y link para editar.
- `DashboardComponent` — el botón "Entrenar hoy" apunta a `/rutinas` en vez de `/rutina`.
- `app.routes.ts` — reestructuración de rutas de rutinas (`/rutinas`, `/rutinas/nueva`, `/rutinas/:id/editar`, `/rutinas/:id`) y nueva ruta `/ejercicios`.

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
