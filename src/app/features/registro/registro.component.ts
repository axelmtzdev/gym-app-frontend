import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RutinasService } from '../../core/services/rutina.service';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { SesionesService } from '../../core/services/sesion.service';
import { EjercicioPlan, ReferenciaEjercicio } from '../../core/models/api.models';
import { BackButtonComponent } from '../../core/layout/back-button.component';

const DURACION_DESCANSO_S = 90;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, BackButtonComponent],
  template: `
    @if (confirmandoSalida()) {
      <div class="mx-auto max-w-md space-y-4 p-6">
        <div class="animate-pop rounded-xl border border-alert/40 bg-surface p-5 text-center">
          <p class="font-semibold text-chalk">¿Salir del entrenamiento?</p>
          <p class="mt-1 text-sm text-chalk-dim">
            Las series que ya guardaste quedan registradas, pero el entrenamiento se marcará como abandonado.
          </p>
          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-lg bg-surface-2 py-2.5 text-sm font-semibold text-chalk transition-colors hover:bg-steel"
              (click)="confirmandoSalida.set(false)"
            >
              Seguir entrenando
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-alert py-2.5 text-sm font-semibold text-chalk transition-opacity hover:opacity-90 disabled:opacity-50"
              [disabled]="saliendo()"
              (click)="confirmarSalida()"
            >
              {{ saliendo() ? 'Saliendo…' : 'Salir y descartar' }}
            </button>
          </div>
        </div>
      </div>
    } @else if (ejercicioActual(); as ej) {
      <div class="mx-auto max-w-md space-y-5 p-6">
        <div>
          <app-back-button class="mb-1 inline-block" (volver)="confirmandoSalida.set(true)" />
          <div class="mb-2 flex gap-1">
            @for (e of ejercicios(); track e.ejercicio_id; let i = $index) {
              <div
                class="h-1 flex-1 rounded-full transition-colors"
                [class]="i < indice() ? 'bg-iron' : i === indice() ? 'bg-chalk-dim' : 'bg-surface-2'"
              ></div>
            }
          </div>
          <h1 class="font-display text-2xl font-extrabold text-chalk">{{ ej.nombre }}</h1>
          <p class="text-sm text-chalk-dim">
            Ejercicio {{ indice() + 1 }} de {{ ejercicios().length }} · Serie {{ numeroSerie() }}
          </p>
        </div>

        @if (descansando()) {
          <div class="animate-pop flex flex-col items-center gap-3 rounded-xl border border-iron/40 bg-surface p-6 text-center">
            <p class="text-xs font-medium uppercase tracking-wide text-chalk-dim">Descanso</p>
            <p class="font-display text-4xl font-extrabold tabular-nums text-iron">{{ tiempoDescansoFormato() }}</p>
            <button
              type="button"
              class="text-sm font-semibold text-chalk-dim underline hover:text-chalk"
              (click)="saltarDescanso()"
            >
              Saltar descanso
            </button>
          </div>
        } @else {
          <div class="animate-step space-y-5">
            @if (ultimaSerieGuardada()) {
              <div class="animate-pop flex items-center gap-2 rounded-lg bg-signal/15 px-3 py-2 text-sm font-semibold text-signal">
                <span aria-hidden="true">✓</span>
                Serie {{ ultimaSerieGuardada() }} guardada
              </div>
            }

            @if (referencia(); as ref) {
              <div class="grid grid-cols-2 gap-3">
                @if (ref.anterior) {
                  <div class="rounded-xl bg-surface p-3">
                    <p class="text-xs text-chalk-dim">La vez pasada</p>
                    <p class="font-display font-extrabold text-chalk">
                      {{ ref.anterior.peso_kg }} kg × {{ ref.anterior.repeticiones }}
                    </p>
                  </div>
                }
                @if (ref.sugerencia) {
                  <div class="rounded-xl border border-iron/50 bg-surface p-3">
                    <p class="text-xs text-chalk-dim">Sugerencia de hoy</p>
                    <p class="font-display font-extrabold text-chalk">
                      {{ ref.sugerencia.peso_kg }} kg × {{ ref.sugerencia.repeticiones }}
                    </p>
                  </div>
                }
              </div>
            } @else {
              <div class="grid grid-cols-2 gap-3">
                <div class="skeleton h-16 rounded-xl"></div>
                <div class="skeleton h-16 rounded-xl"></div>
              </div>
            }

            <div class="space-y-3">
              <label class="block text-sm text-chalk-dim" for="peso">
                Peso (kg)
                <input
                  id="peso"
                  type="number"
                  inputmode="decimal"
                  class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
                  [(ngModel)]="pesoKg"
                  name="pesoKg"
                />
              </label>
              <label class="block text-sm text-chalk-dim" for="reps">
                Repeticiones
                <input
                  id="reps"
                  type="number"
                  inputmode="numeric"
                  class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
                  [(ngModel)]="repeticiones"
                  name="repeticiones"
                />
              </label>
              <label class="block text-sm text-chalk-dim" for="rpe">
                RPE
                <input
                  id="rpe"
                  type="number"
                  min="1"
                  max="10"
                  inputmode="numeric"
                  class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
                  [(ngModel)]="rpe"
                  name="rpe"
                />
              </label>
              <textarea
                placeholder="Nota rápida (opcional)"
                aria-label="Nota rápida"
                class="w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 transition-colors focus:border-iron focus:outline-none"
                [(ngModel)]="nota"
                name="nota"
              ></textarea>
            </div>

            <button
              type="button"
              class="w-full rounded-lg bg-iron py-3 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              [disabled]="!pesoKg || !repeticiones || guardando()"
              (click)="guardarSerie(ej.ejercicio_id)"
            >
              {{ guardando() ? 'Guardando…' : 'Guardar serie y continuar' }}
            </button>

            <button type="button" class="w-full text-sm text-chalk-dim underline hover:text-chalk" (click)="terminar()">
              Terminar entrenamiento
            </button>
          </div>
        }
      </div>
    } @else {
      <div class="mx-auto max-w-md space-y-5 p-6">
        <div class="skeleton h-7 w-48 rounded"></div>
        <div class="skeleton h-4 w-32 rounded"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="skeleton h-16 rounded-xl"></div>
          <div class="skeleton h-16 rounded-xl"></div>
        </div>
        <div class="skeleton h-11 rounded-lg"></div>
        <div class="skeleton h-11 rounded-lg"></div>
        <div class="skeleton h-11 rounded-lg"></div>
      </div>
    }
  `,
})
export class RegistroComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutinasService = inject(RutinasService);
  private readonly ejerciciosService = inject(EjerciciosService);
  private readonly sesionesService = inject(SesionesService);

  private readonly sesionId = this.route.snapshot.paramMap.get('sesionId')!;
  private readonly rutinaId = this.route.snapshot.queryParamMap.get('rutina')!;

  readonly ejercicios = signal<EjercicioPlan[]>([]);
  readonly indice = signal(0);
  readonly numeroSerie = signal(1);
  readonly referencia = signal<ReferenciaEjercicio | null>(null);
  readonly guardando = signal(false);
  readonly ultimaSerieGuardada = signal<number | null>(null);

  readonly descansando = signal(false);
  readonly tiempoDescansoS = signal(DURACION_DESCANSO_S);
  private intervaloDescanso?: ReturnType<typeof setInterval>;

  readonly confirmandoSalida = signal(false);
  readonly saliendo = signal(false);

  readonly ejercicioActual = computed(() => this.ejercicios()[this.indice()]);

  readonly tiempoDescansoFormato = computed(() => {
    const s = this.tiempoDescansoS();
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  });

  pesoKg: number | null = null;
  repeticiones: number | null = null;
  rpe: number | null = null;
  nota = '';

  constructor() {
    this.rutinasService.obtener(this.rutinaId).subscribe((r) => {
      this.ejercicios.set(r.ejercicios);
      this.cargarReferencia();
    });
  }

  guardarSerie(ejercicioId: number): void {
    if (!this.pesoKg || !this.repeticiones) return;

    this.guardando.set(true);
    this.sesionesService
      .registrarSerie(this.sesionId, {
        ejercicio_id: ejercicioId,
        numero_serie: this.numeroSerie(),
        peso_kg: this.pesoKg,
        repeticiones: this.repeticiones,
        rpe: this.rpe ?? undefined,
        nota: this.nota || undefined,
      })
      .subscribe(() => {
        this.guardando.set(false);
        this.ultimaSerieGuardada.set(this.numeroSerie());
        this.numeroSerie.update((n) => n + 1);
        this.pesoKg = null;
        this.repeticiones = null;
        this.rpe = null;
        this.nota = '';

        this.iniciarDescanso();
      });
  }

  private iniciarDescanso(): void {
    this.descansando.set(true);
    this.tiempoDescansoS.set(DURACION_DESCANSO_S);
    clearInterval(this.intervaloDescanso);
    this.intervaloDescanso = setInterval(() => {
      const restante = this.tiempoDescansoS() - 1;
      if (restante <= 0) {
        this.terminarDescanso();
      } else {
        this.tiempoDescansoS.set(restante);
      }
    }, 1000);
  }

  saltarDescanso(): void {
    this.terminarDescanso();
  }

  private terminarDescanso(): void {
    clearInterval(this.intervaloDescanso);
    this.descansando.set(false);
    this.ultimaSerieGuardada.set(null);

    if (this.indice() < this.ejercicios().length - 1) {
      this.indice.update((i) => i + 1);
      this.numeroSerie.set(1);
      this.cargarReferencia();
    }
  }

  terminar(): void {
    clearInterval(this.intervaloDescanso);
    this.sesionesService.actualizar(this.sesionId, { estado: 'completada' }).subscribe(() => {
      this.router.navigate(['/resumen', this.sesionId]);
    });
  }

  confirmarSalida(): void {
    this.saliendo.set(true);
    clearInterval(this.intervaloDescanso);
    this.sesionesService.actualizar(this.sesionId, { estado: 'abandonada' }).subscribe(() => {
      this.router.navigateByUrl('/rutina');
    });
  }

  private cargarReferencia(): void {
    const ej = this.ejercicioActual();
    if (!ej) return;
    this.referencia.set(null);
    this.ejerciciosService
      .referencia(ej.ejercicio_id, this.sesionId)
      .subscribe((ref) => this.referencia.set(ref));
  }
}
