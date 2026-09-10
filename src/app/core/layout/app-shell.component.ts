import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-dvh flex-col overflow-hidden bg-ink">
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>

      <nav
        class="shrink-0 border-t border-steel bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div class="mx-auto flex max-w-md items-stretch">
          <a
            routerLink="/dashboard"
            routerLinkActive="text-iron"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex flex-1 flex-col items-center gap-1 py-2.5 text-chalk-dim transition-colors hover:text-chalk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-[11px] font-medium">Inicio</span>
          </a>

          <a
            routerLink="/rutinas"
            routerLinkActive="text-iron"
            class="flex flex-1 flex-col items-center gap-1 py-2.5 text-chalk-dim transition-colors hover:text-chalk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M6.5 6.5 4 4M17.5 6.5 20 4M6.5 17.5 4 20M17.5 17.5 20 20" stroke-linecap="round" />
              <rect x="6" y="6" width="12" height="12" rx="2.5" />
              <path d="M9.5 9.5v5M14.5 9.5v5" stroke-linecap="round" />
            </svg>
            <span class="text-[11px] font-medium">Rutinas</span>
          </a>

          <a
            routerLink="/ejercicios"
            routerLinkActive="text-iron"
            class="flex flex-1 flex-col items-center gap-1 py-2.5 text-chalk-dim transition-colors hover:text-chalk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M4 12h2M18 12h2M6 8v8M18 8v8M8.5 12h7" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="2.5" y="10" width="3" height="4" rx="1" />
              <rect x="18.5" y="10" width="3" height="4" rx="1" />
            </svg>
            <span class="text-[11px] font-medium">Ejercicios</span>
          </a>

          <a
            routerLink="/historial"
            routerLinkActive="text-iron"
            class="flex flex-1 flex-col items-center gap-1 py-2.5 text-chalk-dim transition-colors hover:text-chalk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-[11px] font-medium">Historial</span>
          </a>

          <button
            type="button"
            (click)="salir()"
            aria-label="Cerrar sesión"
            class="flex flex-1 flex-col items-center gap-1 py-2.5 text-chalk-dim transition-colors hover:text-alert"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M15 4h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10 12h10m0 0-3-3m3 3-3 3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-[11px] font-medium">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);

  salir(): void {
    this.auth.logout();
  }
}
