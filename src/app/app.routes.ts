import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: 'acceso',
    loadComponent: () =>
      import('./features/acceso/acceso.component').then((m) => m.AccesoComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AppShellComponent,
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: 'rutinas',
            loadComponent: () =>
              import('./features/rutinas/rutinas-lista.component').then((m) => m.RutinasListaComponent),
          },
          {
            path: 'ejercicios',
            loadComponent: () =>
              import('./features/ejercicios/ejercicios.component').then((m) => m.EjerciciosComponent),
          },
          {
            path: 'historial',
            loadComponent: () =>
              import('./features/historial/historial.component').then((m) => m.HistorialComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
      {
        path: 'rutinas/nueva',
        loadComponent: () =>
          import('./features/rutina/rutina-form.component').then((m) => m.RutinaFormComponent),
      },
      {
        path: 'rutinas/:id/editar',
        loadComponent: () =>
          import('./features/rutina/rutina-form.component').then((m) => m.RutinaFormComponent),
      },
      {
        path: 'rutinas/:id',
        loadComponent: () =>
          import('./features/rutina/rutina.component').then((m) => m.RutinaComponent),
      },
      {
        path: 'entrenamiento/:sesionId',
        loadComponent: () =>
          import('./features/registro/registro.component').then((m) => m.RegistroComponent),
      },
      {
        path: 'resumen/:sesionId',
        loadComponent: () =>
          import('./features/resumen/resumen.component').then((m) => m.ResumenComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
