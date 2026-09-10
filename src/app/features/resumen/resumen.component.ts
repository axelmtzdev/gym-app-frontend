import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SesionesService } from '../../core/services/sesion.service';
import { BackButtonComponent } from '../../core/layout/back-button.component';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [DecimalPipe, BackButtonComponent],
  template: `
    @if (resumen(); as r) {
      <div class="animate-step mx-auto max-w-md space-y-6 p-6">
        <div>
          <app-back-button class="mb-1 inline-block" (volver)="volverAlInicio()" />
          <h1 class="font-display text-2xl font-extrabold text-chalk">Entrenamiento terminado</h1>
          @if (r.comparacion_anterior.volumen_delta_pct !== null) {
            <p
              class="mt-1 inline-flex items-center gap-1 text-sm font-semibold"
              [class]="r.comparacion_anterior.volumen_delta_pct >= 0 ? 'text-signal' : 'text-alert'"
            >
              {{ r.comparacion_anterior.volumen_delta_pct >= 0 ? '▲' : '▼' }}
              {{ r.comparacion_anterior.volumen_delta_pct | number: '1.0-1' }}% vs. la sesión anterior
            </p>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-surface p-3">
            <span class="block font-display text-2xl font-extrabold text-chalk">
              {{ r.volumen_total | number: '1.0-0' }}<span class="text-sm font-semibold text-chalk-dim"> kg</span>
            </span>
            <span class="text-xs text-chalk-dim">Volumen total</span>
          </div>
          <div class="rounded-xl bg-surface p-3">
            <span class="block font-display text-2xl font-extrabold text-chalk">{{ r.series_completadas }}</span>
            <span class="text-xs text-chalk-dim">Series completadas</span>
          </div>
          <div class="rounded-xl bg-surface p-3">
            <span class="block font-display text-2xl font-extrabold text-chalk">{{ r.rpe_promedio ?? '—' }}</span>
            <span class="text-xs text-chalk-dim">RPE promedio</span>
          </div>
          <div
            class="rounded-xl p-3"
            [class]="r.records_personales > 0 ? 'bg-iron/15 border border-iron/40' : 'bg-surface'"
          >
            <span class="block font-display text-2xl font-extrabold" [class]="r.records_personales > 0 ? 'text-iron' : 'text-chalk'">
              {{ r.records_personales }}
            </span>
            <span class="text-xs text-chalk-dim">Récord{{ r.records_personales === 1 ? '' : 's' }} personal{{ r.records_personales === 1 ? '' : 'es' }}</span>
          </div>
        </div>

        <div class="divide-y divide-steel rounded-xl bg-surface px-4">
          @for (ej of r.ejercicios; track ej.ejercicio_id) {
            <div class="flex justify-between py-3 text-sm text-chalk">
              <span>{{ ej.nombre }}</span>
              <span class="font-display font-bold text-chalk-dim">{{ ej.peso_promedio | number: '1.0-1' }} kg prom.</span>
            </div>
          }
        </div>

        <button
          type="button"
          class="w-full rounded-lg bg-surface py-3 text-sm font-bold text-chalk transition-colors hover:bg-surface-2"
          (click)="verHistorial()"
        >
          Ver mi progreso
        </button>
      </div>
    } @else {
      <div class="mx-auto max-w-md space-y-6 p-6">
        <div class="skeleton h-7 w-56 rounded"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="skeleton h-17 rounded-xl"></div>
          <div class="skeleton h-17 rounded-xl"></div>
          <div class="skeleton h-17 rounded-xl"></div>
          <div class="skeleton h-17 rounded-xl"></div>
        </div>
        <div class="skeleton h-32 rounded-xl"></div>
      </div>
    }
  `,
})
export class ResumenComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sesionesService = inject(SesionesService);

  private readonly sesionId = this.route.snapshot.paramMap.get('sesionId')!;

  readonly resumen = toSignal(this.sesionesService.resumen(this.sesionId));

  verHistorial(): void {
    this.router.navigateByUrl('/historial');
  }

  volverAlInicio(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
