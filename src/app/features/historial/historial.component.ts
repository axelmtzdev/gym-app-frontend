import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Ejercicio, HistorialEjercicio } from '../../core/models/api.models';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="mx-auto max-w-md space-y-5 p-6">
      <h1 class="font-display text-2xl font-extrabold text-chalk">Historial</h1>

      @if (cargandoEjercicios()) {
        <div class="flex gap-2">
          <div class="skeleton h-8 w-24 rounded-lg"></div>
          <div class="skeleton h-8 w-24 rounded-lg"></div>
          <div class="skeleton h-8 w-24 rounded-lg"></div>
        </div>
      } @else if (!ejercicios().length) {
        <div class="flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center">
          <p class="text-sm font-semibold text-chalk">Aún no hay ejercicios registrados</p>
          <p class="text-sm text-chalk-dim">Cuando termines un entrenamiento, tu progreso aparecerá aquí.</p>
        </div>
      } @else {
        <div class="flex gap-2 overflow-x-auto pb-1" role="tablist">
          @for (ej of ejercicios(); track ej.id) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="ejercicioSeleccionado() === ej.id"
              class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
              [class]="ejercicioSeleccionado() === ej.id ? 'bg-iron text-iron-ink' : 'bg-surface text-chalk-dim hover:text-chalk'"
              (click)="seleccionar(ej.id)"
            >
              {{ ej.nombre }}
            </button>
          }
        </div>

        @if (cargandoHistorial()) {
          <div class="space-y-3">
            <div class="skeleton h-16 rounded-xl"></div>
            <div class="skeleton h-24 rounded-xl"></div>
            <div class="skeleton h-40 rounded-xl"></div>
          </div>
        } @else if (historial(); as h) {
          @if (!h.sesiones.length) {
            <div class="animate-step flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center">
              <p class="text-sm font-semibold text-chalk">Sin historial todavía</p>
              <p class="text-sm text-chalk-dim">Registra series de este ejercicio para ver tu progreso aquí.</p>
            </div>
          } @else {
            <div class="animate-step space-y-4">
              <div class="flex gap-2">
                <div class="flex-1 rounded-lg bg-surface p-2 text-center">
                  <span class="block font-display text-lg font-extrabold text-chalk">{{ h.pr }} kg</span>
                  <span class="text-[10px] text-chalk-dim">Récord</span>
                </div>
                <div class="flex-1 rounded-lg bg-surface p-2 text-center">
                  <span
                    class="block font-display text-lg font-extrabold"
                    [class]="h.tendencia_pct >= 0 ? 'text-signal' : 'text-alert'"
                  >
                    {{ h.tendencia_pct >= 0 ? '+' : '' }}{{ h.tendencia_pct }}%
                  </span>
                  <span class="text-[10px] text-chalk-dim">Tendencia</span>
                </div>
                <div class="flex-1 rounded-lg bg-surface p-2 text-center">
                  <span class="block font-display text-lg font-extrabold text-chalk">
                    {{ h.ultima_vez ? (h.ultima_vez | date: 'd MMM') : '—' }}
                  </span>
                  <span class="text-[10px] text-chalk-dim">Última vez</span>
                </div>
              </div>

              @if (puntosSvg(); as pts) {
                <div class="rounded-xl bg-surface p-3">
                  <p class="mb-2 text-xs font-medium text-chalk-dim">Peso máximo por sesión</p>
                  <svg viewBox="0 0 300 80" class="h-20 w-full" preserveAspectRatio="none">
                    <polyline [attr.points]="pts" fill="none" stroke="var(--color-iron)" stroke-width="2" />
                  </svg>
                </div>
              }

              <div class="divide-y divide-steel rounded-xl bg-surface px-4">
                @for (s of h.sesiones; track s.fecha) {
                  <div class="flex justify-between py-2.5 text-sm">
                    <span class="text-chalk-dim">{{ s.fecha | date: 'd MMM' }}</span>
                    <span class="font-display font-bold text-chalk">{{ s.peso_kg }} kg × {{ s.repeticiones }}</span>
                    <span class="text-chalk-dim">RPE {{ s.rpe ?? '—' }}</span>
                  </div>
                }
              </div>
            </div>
          }
        }
      }
    </div>
  `,
})
export class HistorialComponent {
  private readonly ejerciciosService = inject(EjerciciosService);

  readonly cargandoEjercicios = signal(true);
  readonly cargandoHistorial = signal(false);
  readonly ejercicios = signal<Ejercicio[]>([]);
  readonly ejercicioSeleccionado = signal<number | null>(null);
  readonly historial = signal<HistorialEjercicio | null>(null);

  readonly puntosSvg = computed<string | null>(() => {
    const puntos = this.historial()?.puntos ?? [];
    if (puntos.length < 2) return null;
    const pesos = puntos.map((p) => p.peso_max);
    const min = Math.min(...pesos);
    const max = Math.max(...pesos);
    const rango = max - min || 1;
    return puntos
      .map((p, i) => {
        const x = (i / (puntos.length - 1)) * 300;
        const y = 76 - ((p.peso_max - min) / rango) * 72;
        return `${x},${y}`;
      })
      .join(' ');
  });

  constructor() {
    this.ejerciciosService.listar().subscribe((lista) => {
      this.ejercicios.set(lista);
      this.cargandoEjercicios.set(false);
      if (lista.length) {
        this.seleccionar(lista[0].id);
      }
    });
  }

  seleccionar(id: number): void {
    this.ejercicioSeleccionado.set(id);
    this.cargandoHistorial.set(true);
    this.ejerciciosService.historial(id).subscribe((h) => {
      this.historial.set(h);
      this.cargandoHistorial.set(false);
    });
  }
}
