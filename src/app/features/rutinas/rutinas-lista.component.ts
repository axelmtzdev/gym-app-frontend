import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RutinasService } from '../../core/services/rutina.service';
import { Rutina } from '../../core/models/api.models';

@Component({
  selector: 'app-rutinas-lista',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-md space-y-5 p-6">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-2xl font-extrabold text-chalk">Rutinas</h1>
        <a
          routerLink="/rutinas/nueva"
          class="rounded-lg bg-iron px-3 py-1.5 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90"
        >
          + Crear rutina
        </a>
      </div>

      @if (cargando()) {
        <div class="space-y-3">
          <div class="skeleton h-28 rounded-xl"></div>
          <div class="skeleton h-28 rounded-xl"></div>
        </div>
      } @else if (!rutinas().length) {
        <div class="animate-step flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-12 text-center">
          <p class="text-sm font-semibold text-chalk">Aún no tienes rutinas</p>
          <p class="text-sm text-chalk-dim">Crea tu primera rutina para empezar a entrenar.</p>
        </div>
      } @else {
        <div class="animate-step space-y-3">
          @for (r of rutinas(); track r.id) {
            <a
              [routerLink]="['/rutinas', r.id]"
              class="block rounded-xl bg-surface p-4 transition-colors hover:bg-surface-2"
            >
              <div class="flex items-start justify-between gap-3">
                <h2 class="font-display font-bold text-chalk">{{ r.nombre }}</h2>
                <span class="shrink-0 text-xs text-chalk-dim">{{ r.total_ejercicios }} ejercicios</span>
              </div>
              @if (r.descripcion) {
                <p class="mt-0.5 text-sm text-chalk-dim">{{ r.descripcion }}</p>
              }
              @if (r.grupos.length) {
                <div class="mt-2 flex flex-wrap gap-1.5">
                  @for (g of r.grupos; track g) {
                    <span class="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-chalk-dim">{{ g }}</span>
                  }
                </div>
              }
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class RutinasListaComponent {
  private readonly rutinasService = inject(RutinasService);

  readonly cargando = signal(true);
  readonly rutinas = signal<Rutina[]>([]);

  constructor() {
    this.rutinasService.listar().subscribe((lista) => {
      this.rutinas.set(lista);
      this.cargando.set(false);
    });
  }
}
