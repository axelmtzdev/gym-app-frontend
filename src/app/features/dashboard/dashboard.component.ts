import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="mx-auto max-w-md space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-2xl font-extrabold text-chalk">Hola</h1>
        @if (dashboard(); as d) {
          @if (d.racha_dias > 0) {
            <span class="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-iron">
              🔥 {{ d.racha_dias }} {{ d.racha_dias === 1 ? 'día' : 'días' }}
            </span>
          }
        }
      </div>

      @if (dashboard(); as d) {
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-surface p-3">
            <span class="block font-display text-2xl font-extrabold text-chalk">{{ d.mes.entrenamientos }}</span>
            <span class="text-xs text-chalk-dim">Entrenamientos este mes</span>
          </div>
          <div class="rounded-xl bg-surface p-3">
            <span class="block font-display text-2xl font-extrabold text-chalk">
              {{ d.mes.volumen_total | number: '1.0-0' }}<span class="text-sm font-semibold text-chalk-dim"> kg</span>
            </span>
            <span class="text-xs text-chalk-dim">Volumen total</span>
          </div>
        </div>

        @if (d.mes.semanas.length) {
          <div class="rounded-xl bg-surface p-3">
            <p class="mb-3 text-xs font-medium text-chalk-dim">Entrenamientos por semana</p>
            <div class="flex items-end gap-2" style="height: 64px">
              @for (s of d.mes.semanas; track s.etiqueta) {
                <div class="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    class="w-full rounded-t bg-iron transition-all"
                    [style.height.%]="alturaBarra(s.entrenamientos, d.mes.semanas)"
                    [style.min-height.px]="s.entrenamientos > 0 ? 4 : 0"
                  ></div>
                  <span class="text-[10px] text-chalk-dim">{{ s.etiqueta }}</span>
                </div>
              }
            </div>
          </div>
        }

        @if (d.recomendaciones.length) {
          <div class="space-y-2">
            @for (r of d.recomendaciones; track r.mensaje) {
              <div
                class="rounded-xl border-l-4 bg-surface p-3 text-sm text-chalk"
                [class]="r.tipo === 'atencion' ? 'border-l-iron' : 'border-l-signal'"
              >
                {{ r.mensaje }}
              </div>
            }
          </div>
        }
      } @else {
        <div class="grid grid-cols-2 gap-3">
          <div class="skeleton h-17 rounded-xl"></div>
          <div class="skeleton h-17 rounded-xl"></div>
        </div>
        <div class="skeleton h-24 rounded-xl"></div>
        <div class="skeleton h-14 rounded-xl"></div>
      }

      <div class="flex gap-3">
        <a
          routerLink="/rutina"
          class="flex-1 rounded-lg bg-iron py-3 text-center text-sm font-bold text-iron-ink transition-opacity hover:opacity-90"
        >
          Entrenar hoy
        </a>
        <a
          routerLink="/historial"
          class="flex-1 rounded-lg bg-surface py-3 text-center text-sm font-bold text-chalk transition-colors hover:bg-surface-2"
        >
          Ver historial
        </a>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly dashboard = toSignal(this.dashboardService.obtener());

  alturaBarra(valor: number, semanas: { entrenamientos: number }[]): number {
    const max = Math.max(...semanas.map((s) => s.entrenamientos), 1);
    return (valor / max) * 100;
  }
}
