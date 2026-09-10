import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RutinasService } from '../../core/services/rutina.service';
import { SesionesService } from '../../core/services/sesion.service';
import { RutinaDetalle } from '../../core/models/api.models';
import { BackButtonComponent } from '../../core/layout/back-button.component';

@Component({
  selector: 'app-rutina',
  standalone: true,
  imports: [RouterLink, BackButtonComponent],
  template: `
    <div class="mx-auto max-w-md space-y-6 p-6">
      <app-back-button (volver)="router.navigateByUrl('/rutinas')" />

      @if (cargada()) {
        @if (rutina(); as r) {
          <div class="animate-step space-y-6">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h1 class="font-display text-2xl font-extrabold text-chalk">{{ r.nombre }}</h1>
                <p class="text-sm text-chalk-dim">
                  {{ r.descripcion }} · {{ r.entrenamientos_esta_semana }} entrenamientos esta semana
                </p>
              </div>
              <a
                [routerLink]="['/rutinas', r.id, 'editar']"
                class="shrink-0 text-sm font-semibold text-iron hover:underline"
              >
                Editar
              </a>
            </div>

            @if (r.grupos.length) {
              <div class="flex flex-wrap gap-1.5">
                @for (g of r.grupos; track g) {
                  <span class="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-chalk-dim">{{ g }}</span>
                }
              </div>
            }

            <div class="divide-y divide-steel rounded-xl bg-surface px-4">
              @for (ej of r.ejercicios; track ej.ejercicio_id) {
                <div class="flex items-center justify-between py-3 text-sm text-chalk">
                  <span>{{ ej.nombre }}</span>
                  <span class="font-display font-bold text-chalk-dim">{{ ej.series_objetivo }}×{{ ej.reps_objetivo }}</span>
                </div>
              }
            </div>

            <button
              type="button"
              class="w-full rounded-lg bg-iron py-3 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              [disabled]="empezando()"
              (click)="empezar(r.id)"
            >
              {{ empezando() ? 'Preparando…' : 'Empezar entrenamiento' }}
            </button>
          </div>
        } @else {
          <div class="animate-step flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-12 text-center">
            <p class="text-sm font-semibold text-chalk">Esta rutina ya no está disponible</p>
            <p class="text-sm text-chalk-dim">Puede que se haya eliminado o ya no sea tuya.</p>
            <a routerLink="/rutinas" class="mt-2 text-sm font-semibold text-iron hover:underline">
              Volver a mis rutinas
            </a>
          </div>
        }
      } @else {
        <div class="space-y-6">
          <div class="space-y-2">
            <div class="skeleton h-7 w-40 rounded"></div>
            <div class="skeleton h-4 w-56 rounded"></div>
          </div>
          <div class="skeleton h-48 rounded-xl"></div>
          <div class="skeleton h-12 rounded-lg"></div>
        </div>
      }
    </div>
  `,
})
export class RutinaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly rutinasService = inject(RutinasService);
  private readonly sesionesService = inject(SesionesService);
  readonly router = inject(Router);

  private readonly rutinaId = this.route.snapshot.paramMap.get('id')!;

  readonly cargada = signal(false);
  readonly empezando = signal(false);
  readonly rutina = signal<RutinaDetalle | undefined>(undefined);

  constructor() {
    this.rutinasService.obtener(this.rutinaId).subscribe({
      next: (r) => {
        this.rutina.set(r);
        this.cargada.set(true);
      },
      error: () => {
        this.rutina.set(undefined);
        this.cargada.set(true);
      },
    });
  }

  empezar(rutinaId: string): void {
    this.empezando.set(true);
    this.sesionesService.crear(rutinaId).subscribe((sesion) => {
      this.router.navigate(['/entrenamiento', sesion.id], { queryParams: { rutina: rutinaId } });
    });
  }
}
