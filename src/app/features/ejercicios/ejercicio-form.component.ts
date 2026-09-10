import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Ejercicio, GRUPOS_MUSCULARES } from '../../core/models/api.models';

@Component({
  selector: 'app-ejercicio-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="animate-step space-y-5">
      <h2 class="font-display text-xl font-extrabold text-chalk">
        {{ ejercicio() ? 'Editar ejercicio' : 'Nuevo ejercicio' }}
      </h2>

      @if (error()) {
        <div class="rounded-lg bg-alert/15 px-3 py-2 text-sm font-medium text-alert">{{ error() }}</div>
      }

      <div class="space-y-3">
        <label class="block text-sm text-chalk-dim" for="ej-nombre">
          Nombre
          <input
            id="ej-nombre"
            type="text"
            class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
            [(ngModel)]="nombre"
            name="nombre"
          />
        </label>

        <div>
          <p class="mb-1.5 text-sm text-chalk-dim">Grupo muscular</p>
          <div class="flex flex-wrap gap-2">
            @for (g of grupos; track g) {
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                [class]="grupo() === g ? 'bg-iron text-iron-ink' : 'bg-surface-2 text-chalk-dim hover:text-chalk'"
                (click)="grupo.set(g)"
              >
                {{ g }}
              </button>
            }
          </div>
        </div>

        <label class="block text-sm text-chalk-dim" for="ej-equipo">
          Equipo (opcional)
          <input
            id="ej-equipo"
            type="text"
            class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
            [(ngModel)]="equipo"
            name="equipo"
          />
        </label>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg bg-surface-2 py-2.5 text-sm font-semibold text-chalk transition-colors hover:bg-steel"
          (click)="cancelado.emit()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-iron py-2.5 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          [disabled]="!nombre.trim() || !grupo() || guardando()"
          (click)="guardar()"
        >
          {{ guardando() ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>

      @if (ejercicio()) {
        @if (confirmandoDesactivar()) {
          <div class="rounded-lg bg-alert/10 p-3 text-sm text-chalk">
            <p>¿Desactivar este ejercicio? Dejará de aparecer en el catálogo.</p>
            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg bg-surface-2 py-2 text-sm font-semibold text-chalk hover:bg-steel"
                (click)="confirmandoDesactivar.set(false)"
              >
                No
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg bg-alert py-2 text-sm font-semibold text-chalk transition-opacity hover:opacity-90 disabled:opacity-50"
                [disabled]="desactivando()"
                (click)="desactivar()"
              >
                {{ desactivando() ? 'Desactivando…' : 'Sí, desactivar' }}
              </button>
            </div>
          </div>
        } @else {
          <button
            type="button"
            class="w-full text-center text-sm text-alert underline hover:opacity-80"
            (click)="confirmandoDesactivar.set(true)"
          >
            Desactivar ejercicio
          </button>
        }
      }
    </div>
  `,
})
export class EjercicioFormComponent {
  private readonly ejerciciosService = inject(EjerciciosService);

  readonly grupos = GRUPOS_MUSCULARES;

  readonly ejercicio = input<Ejercicio | null>(null);
  readonly grupoPreseleccionado = input<string | null>(null);

  readonly guardado = output<Ejercicio>();
  readonly cancelado = output<void>();
  readonly desactivado = output<void>();

  nombre = '';
  equipo = '';
  readonly grupo = signal<string | null>(null);

  readonly guardando = signal(false);
  readonly desactivando = signal(false);
  readonly confirmandoDesactivar = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const ej = this.ejercicio();
      this.nombre = ej?.nombre ?? '';
      this.equipo = ej?.equipo ?? '';
      this.grupo.set(ej?.grupo_muscular ?? this.grupoPreseleccionado());
    });
  }

  guardar(): void {
    const grupo = this.grupo();
    if (!this.nombre.trim() || !grupo) return;

    this.guardando.set(true);
    this.error.set(null);

    const payload = {
      nombre: this.nombre.trim(),
      grupo_muscular: grupo,
      equipo: this.equipo.trim() || undefined,
    };

    const ej = this.ejercicio();
    const request = ej
      ? this.ejerciciosService.actualizar(ej.id, payload)
      : this.ejerciciosService.crear(payload);

    request.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.guardado.emit(resultado);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(
          err.status === 409
            ? 'Ya existe un ejercicio con ese nombre.'
            : 'No se pudo guardar el ejercicio. Revisa los datos e intenta de nuevo.',
        );
      },
    });
  }

  desactivar(): void {
    const ej = this.ejercicio();
    if (!ej) return;

    this.desactivando.set(true);
    this.ejerciciosService.actualizar(ej.id, { activo: false }).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.desactivado.emit();
      },
      error: () => {
        this.desactivando.set(false);
        this.error.set('No se pudo desactivar el ejercicio. Intenta de nuevo.');
      },
    });
  }
}
