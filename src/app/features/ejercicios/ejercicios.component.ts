import { Component, computed, inject, signal } from '@angular/core';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Ejercicio, GRUPOS_MUSCULARES } from '../../core/models/api.models';
import { EjercicioFormComponent } from './ejercicio-form.component';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [EjercicioFormComponent],
  template: `
    <div class="mx-auto max-w-md space-y-5 p-6">
      @if (formAbierto()) {
        <app-ejercicio-form
          [ejercicio]="editando()"
          (guardado)="onGuardado()"
          (desactivado)="onDesactivado()"
          (cancelado)="formAbierto.set(false)"
        />
      } @else {
        <div class="flex items-center justify-between">
          <h1 class="font-display text-2xl font-extrabold text-chalk">Ejercicios</h1>
          <button
            type="button"
            class="rounded-lg bg-iron px-3 py-1.5 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90"
            (click)="abrirNuevo()"
          >
            + Nuevo ejercicio
          </button>
        </div>

        @if (cargando()) {
          <div class="space-y-3">
            <div class="skeleton h-32 rounded-xl"></div>
            <div class="skeleton h-32 rounded-xl"></div>
          </div>
        } @else if (!ejercicios().length) {
          <div class="animate-step flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-12 text-center">
            <p class="text-sm font-semibold text-chalk">Aún no hay ejercicios</p>
            <p class="text-sm text-chalk-dim">Crea el primero para poder agregarlo a tus rutinas.</p>
          </div>
        } @else {
          <div class="animate-step space-y-4">
            @for (grupo of gruposConEjercicios(); track grupo.nombre) {
              <div class="rounded-xl bg-surface-2 p-3">
                <p class="mb-2 text-xs font-bold uppercase tracking-wide text-iron">{{ grupo.nombre }}</p>
                <div class="divide-y divide-steel">
                  @for (ej of grupo.ejercicios; track ej.id) {
                    <button
                      type="button"
                      class="flex w-full items-center justify-between py-2.5 text-left text-sm text-chalk"
                      (click)="abrirEdicion(ej)"
                    >
                      <span>{{ ej.nombre }}</span>
                      @if (ej.equipo) {
                        <span class="text-xs text-chalk-dim">{{ ej.equipo }}</span>
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class EjerciciosComponent {
  private readonly ejerciciosService = inject(EjerciciosService);

  readonly cargando = signal(true);
  readonly ejercicios = signal<Ejercicio[]>([]);
  readonly formAbierto = signal(false);
  readonly editando = signal<Ejercicio | null>(null);

  readonly gruposConEjercicios = computed(() =>
    GRUPOS_MUSCULARES.map((nombre) => ({
      nombre,
      ejercicios: this.ejercicios().filter((ej) => ej.grupo_muscular === nombre),
    })).filter((g) => g.ejercicios.length > 0),
  );

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.ejerciciosService.listar().subscribe((lista) => {
      this.ejercicios.set(lista);
      this.cargando.set(false);
    });
  }

  abrirNuevo(): void {
    this.editando.set(null);
    this.formAbierto.set(true);
  }

  abrirEdicion(ej: Ejercicio): void {
    this.editando.set(ej);
    this.formAbierto.set(true);
  }

  onGuardado(): void {
    this.formAbierto.set(false);
    this.cargar();
  }

  onDesactivado(): void {
    this.formAbierto.set(false);
    this.cargar();
  }
}
