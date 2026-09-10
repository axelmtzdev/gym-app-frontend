import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, concatMap, from, map, of, switchMap, toArray } from 'rxjs';
import { RutinasService } from '../../core/services/rutina.service';
import { EjerciciosService } from '../../core/services/ejercicios.service';
import { Ejercicio, GRUPOS_MUSCULARES } from '../../core/models/api.models';
import { BackButtonComponent } from '../../core/layout/back-button.component';
import { EjercicioFormComponent } from '../ejercicios/ejercicio-form.component';

interface EjercicioDraft {
  ejercicio_id: number;
  nombre: string;
  series_objetivo: number;
  reps_objetivo: number;
  rutinaEjercicioId?: number;
}

@Component({
  selector: 'app-rutina-form',
  standalone: true,
  imports: [FormsModule, RouterLink, BackButtonComponent, EjercicioFormComponent],
  template: `
    <div class="mx-auto max-w-md space-y-5 p-6">
      @if (creandoEjercicio()) {
        <app-ejercicio-form
          [ejercicio]="null"
          [grupoPreseleccionado]="gruposSeleccionados()[0] || null"
          (guardado)="onEjercicioCreado($event)"
          (cancelado)="creandoEjercicio.set(false)"
        />
      } @else if (pickerAbierto()) {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <app-back-button (volver)="pickerAbierto.set(false)" />
            <button type="button" class="text-sm font-semibold text-iron hover:underline" (click)="toggleVerTodos()">
              {{ filtroTodos() ? 'Ver solo de la rutina' : 'Ver todos los ejercicios' }}
            </button>
          </div>

          @if (cargandoCatalogo()) {
            <div class="space-y-3">
              <div class="skeleton h-24 rounded-xl"></div>
              <div class="skeleton h-24 rounded-xl"></div>
            </div>
          } @else {
            <div class="space-y-4">
              @for (grupo of catalogoAgrupado(); track grupo.nombre) {
                <div class="rounded-xl bg-surface-2 p-3">
                  <p class="mb-2 text-xs font-bold uppercase tracking-wide text-iron">{{ grupo.nombre }}</p>
                  <div class="divide-y divide-steel">
                    @for (ej of grupo.ejercicios; track ej.id) {
                      <button
                        type="button"
                        class="flex w-full items-center justify-between py-2.5 text-left text-sm"
                        [class]="estaAgregado(ej.id) ? 'text-iron' : 'text-chalk'"
                        (click)="toggleEjercicio(ej)"
                      >
                        <span>{{ ej.nombre }}</span>
                        @if (estaAgregado(ej.id)) {
                          <span aria-hidden="true">✓</span>
                        }
                      </button>
                    }
                  </div>
                </div>
              } @empty {
                <p class="py-6 text-center text-sm text-chalk-dim">No hay ejercicios para mostrar.</p>
              }
            </div>
          }

          <button
            type="button"
            class="w-full text-center text-sm text-chalk-dim underline hover:text-chalk"
            (click)="creandoEjercicio.set(true)"
          >
            ¿No lo encuentras? Crear nuevo ejercicio
          </button>
        </div>
      } @else if (cargando()) {
        <div class="space-y-5">
          <div class="skeleton h-7 w-40 rounded"></div>
          <div class="skeleton h-24 rounded-xl"></div>
          <div class="skeleton h-40 rounded-xl"></div>
        </div>
      } @else if (noDisponible()) {
        <div class="animate-step flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-12 text-center">
          <p class="text-sm font-semibold text-chalk">Esta rutina ya no está disponible</p>
          <a routerLink="/rutinas" class="mt-2 text-sm font-semibold text-iron hover:underline">Volver a mis rutinas</a>
        </div>
      } @else {
        <div class="animate-step space-y-5">
          <div class="flex items-center gap-2">
            <app-back-button (volver)="volver()" />
            <h1 class="font-display text-xl font-extrabold text-chalk">
              {{ modo === 'editar' ? 'Editar rutina' : 'Nueva rutina' }}
            </h1>
          </div>

          <div class="space-y-3">
            <label class="block text-sm text-chalk-dim" for="rut-nombre">
              Nombre
              <input
                id="rut-nombre"
                type="text"
                class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-base text-chalk transition-colors focus:border-iron focus:outline-none"
                [ngModel]="nombre()"
                (ngModelChange)="nombre.set($event)"
                name="nombre"
              />
            </label>
            <label class="block text-sm text-chalk-dim" for="rut-descripcion">
              Descripción
              <textarea
                id="rut-descripcion"
                class="mt-1 w-full rounded-lg border border-steel bg-surface-2 px-3 py-2.5 text-sm text-chalk transition-colors focus:border-iron focus:outline-none"
                [(ngModel)]="descripcion"
                name="descripcion"
              ></textarea>
            </label>

            <div>
              <p class="mb-1.5 text-sm text-chalk-dim">Grupos musculares (máximo 3)</p>
              <div class="flex flex-wrap gap-2">
                @for (g of grupos; track g) {
                  <button
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    [class]="gruposSeleccionados().includes(g) ? 'bg-iron text-iron-ink' : 'bg-surface-2 text-chalk-dim hover:text-chalk'"
                    [disabled]="!gruposSeleccionados().includes(g) && gruposSeleccionados().length >= 3"
                    (click)="toggleGrupo(g)"
                  >
                    {{ g }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm text-chalk-dim">Ejercicios</p>

            @if (!ejercicios().length) {
              <div class="rounded-xl bg-surface px-4 py-6 text-center text-sm text-chalk-dim">
                Aún no has agregado ejercicios.
              </div>
            } @else {
              <div class="space-y-2">
                @for (ej of ejercicios(); track ej.ejercicio_id; let i = $index) {
                  <div class="flex items-center gap-2 rounded-xl bg-surface p-3">
                    <div class="flex flex-col">
                      <button
                        type="button"
                        aria-label="Subir"
                        class="text-chalk-dim hover:text-chalk disabled:opacity-30"
                        [disabled]="i === 0"
                        (click)="mover(i, -1)"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="Bajar"
                        class="text-chalk-dim hover:text-chalk disabled:opacity-30"
                        [disabled]="i === ejercicios().length - 1"
                        (click)="mover(i, 1)"
                      >
                        ▼
                      </button>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-chalk">{{ ej.nombre }}</p>
                      <div class="mt-1 flex items-center gap-2 text-sm text-chalk-dim">
                        <input
                          type="number"
                          inputmode="numeric"
                          aria-label="Series"
                          class="w-14 rounded-lg border border-steel bg-surface-2 px-2 py-1 text-center text-chalk focus:border-iron focus:outline-none"
                          [(ngModel)]="ej.series_objetivo"
                          [name]="'series-' + i"
                          (change)="onCampoChange(ej)"
                        />
                        <span>×</span>
                        <input
                          type="number"
                          inputmode="numeric"
                          aria-label="Repeticiones"
                          class="w-14 rounded-lg border border-steel bg-surface-2 px-2 py-1 text-center text-chalk focus:border-iron focus:outline-none"
                          [(ngModel)]="ej.reps_objetivo"
                          [name]="'reps-' + i"
                          (change)="onCampoChange(ej)"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Quitar ejercicio"
                      class="text-chalk-dim hover:text-alert"
                      (click)="quitar(ej)"
                    >
                      ✕
                    </button>
                  </div>
                }
              </div>
            }

            <button
              type="button"
              class="w-full rounded-lg bg-surface-2 py-2.5 text-sm font-semibold text-chalk transition-colors hover:bg-steel disabled:cursor-not-allowed disabled:opacity-40"
              [disabled]="!gruposSeleccionados().length"
              (click)="abrirPicker()"
            >
              + Agregar ejercicio
            </button>
            @if (!gruposSeleccionados().length) {
              <p class="text-xs text-chalk-dim">Elige al menos un grupo muscular para agregar ejercicios.</p>
            }
          </div>

          <button
            type="button"
            class="w-full rounded-lg bg-iron py-3 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="!puedeGuardar() || guardandoRutina()"
            (click)="guardarRutina()"
          >
            {{ guardandoRutina() ? 'Guardando…' : 'Guardar rutina' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class RutinaFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutinasService = inject(RutinasService);
  private readonly ejerciciosService = inject(EjerciciosService);

  readonly grupos = GRUPOS_MUSCULARES;

  readonly modo: 'crear' | 'editar';
  private rutinaId: string | null;

  readonly cargando = signal(false);
  readonly noDisponible = signal(false);
  readonly guardandoRutina = signal(false);

  readonly nombre = signal('');
  descripcion = '';
  readonly gruposSeleccionados = signal<string[]>([]);
  readonly ejercicios = signal<EjercicioDraft[]>([]);

  readonly pickerAbierto = signal(false);
  readonly creandoEjercicio = signal(false);
  readonly filtroTodos = signal(false);
  readonly cargandoCatalogo = signal(false);
  readonly catalogo = signal<Ejercicio[]>([]);

  readonly catalogoAgrupado = computed(() =>
    this.grupos
      .map((nombre) => ({
        nombre,
        ejercicios: this.catalogo().filter((ej) => ej.grupo_muscular === nombre),
      }))
      .filter((g) => g.ejercicios.length > 0),
  );

  readonly puedeGuardar = computed(
    () => !!this.nombre().trim() && this.gruposSeleccionados().length > 0 && this.ejercicios().length > 0,
  );

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    this.modo = id ? 'editar' : 'crear';
    this.rutinaId = id;

    if (this.modo === 'editar' && id) {
      this.cargando.set(true);
      this.rutinasService.obtener(id).subscribe({
        next: (r) => {
          this.nombre.set(r.nombre);
          this.descripcion = r.descripcion ?? '';
          this.gruposSeleccionados.set(r.grupos);
          this.ejercicios.set(
            r.ejercicios.map((ej) => ({
              ejercicio_id: ej.ejercicio_id,
              nombre: ej.nombre,
              series_objetivo: ej.series_objetivo,
              reps_objetivo: ej.reps_objetivo,
              rutinaEjercicioId: ej.id,
            })),
          );
          this.cargando.set(false);
        },
        error: () => {
          this.noDisponible.set(true);
          this.cargando.set(false);
        },
      });
    }
  }

  volver(): void {
    if (this.modo === 'editar' && this.rutinaId) {
      this.router.navigate(['/rutinas', this.rutinaId]);
    } else {
      this.router.navigateByUrl('/rutinas');
    }
  }

  toggleGrupo(g: string): void {
    this.gruposSeleccionados.update((list) => {
      if (list.includes(g)) return list.filter((x) => x !== g);
      if (list.length >= 3) return list;
      return [...list, g];
    });
  }

  estaAgregado(ejercicioId: number): boolean {
    return this.ejercicios().some((e) => e.ejercicio_id === ejercicioId);
  }

  toggleEjercicio(ej: Ejercicio): void {
    if (this.estaAgregado(ej.id)) {
      const draft = this.ejercicios().find((e) => e.ejercicio_id === ej.id);
      if (draft) this.quitar(draft);
      return;
    }

    const draft: EjercicioDraft = {
      ejercicio_id: ej.id,
      nombre: ej.nombre,
      series_objetivo: 3,
      reps_objetivo: 10,
    };

    if (this.modo === 'editar' && this.rutinaId) {
      const orden = this.ejercicios().length + 1;
      this.rutinasService
        .agregarEjercicio(this.rutinaId, {
          ejercicio_id: ej.id,
          orden,
          series_objetivo: draft.series_objetivo,
          reps_objetivo: draft.reps_objetivo,
        })
        .subscribe((row) => {
          this.ejercicios.update((list) => [...list, { ...draft, rutinaEjercicioId: row.id }]);
        });
    } else {
      this.ejercicios.update((list) => [...list, draft]);
    }
  }

  quitar(ej: EjercicioDraft): void {
    if (this.modo === 'editar' && this.rutinaId && ej.rutinaEjercicioId) {
      this.rutinasService.quitarEjercicio(this.rutinaId, ej.rutinaEjercicioId).subscribe(() => {
        this.ejercicios.update((list) => list.filter((e) => e !== ej));
      });
    } else {
      this.ejercicios.update((list) => list.filter((e) => e !== ej));
    }
  }

  mover(index: number, direccion: -1 | 1): void {
    const list = this.ejercicios();
    const destino = index + direccion;
    if (destino < 0 || destino >= list.length) return;

    const nuevaLista = [...list];
    [nuevaLista[index], nuevaLista[destino]] = [nuevaLista[destino], nuevaLista[index]];
    this.ejercicios.set(nuevaLista);

    if (this.modo === 'editar' && this.rutinaId) {
      const a = nuevaLista[index];
      const b = nuevaLista[destino];
      if (a.rutinaEjercicioId) {
        this.rutinasService.actualizarEjercicio(this.rutinaId, a.rutinaEjercicioId, { orden: index + 1 }).subscribe();
      }
      if (b.rutinaEjercicioId) {
        this.rutinasService.actualizarEjercicio(this.rutinaId, b.rutinaEjercicioId, { orden: destino + 1 }).subscribe();
      }
    }
  }

  onCampoChange(ej: EjercicioDraft): void {
    if (this.modo === 'editar' && this.rutinaId && ej.rutinaEjercicioId) {
      this.rutinasService
        .actualizarEjercicio(this.rutinaId, ej.rutinaEjercicioId, {
          series_objetivo: Number(ej.series_objetivo),
          reps_objetivo: Number(ej.reps_objetivo),
        })
        .subscribe();
    }
  }

  abrirPicker(): void {
    if (!this.gruposSeleccionados().length) return;
    this.filtroTodos.set(false);
    this.pickerAbierto.set(true);
    this.cargarCatalogo();
  }

  toggleVerTodos(): void {
    this.filtroTodos.update((v) => !v);
    this.cargarCatalogo();
  }

  private cargarCatalogo(): void {
    this.cargandoCatalogo.set(true);
    const grupos = this.filtroTodos() ? undefined : this.gruposSeleccionados();
    this.ejerciciosService.listar(grupos).subscribe((lista) => {
      this.catalogo.set(lista);
      this.cargandoCatalogo.set(false);
    });
  }

  onEjercicioCreado(ej: Ejercicio): void {
    this.catalogo.update((list) => [...list, ej]);
    this.creandoEjercicio.set(false);
  }

  guardarRutina(): void {
    if (!this.puedeGuardar()) return;
    this.guardandoRutina.set(true);

    if (this.modo === 'editar' && this.rutinaId) {
      this.rutinasService
        .actualizar(this.rutinaId, { nombre: this.nombre().trim(), descripcion: this.descripcion.trim() || null })
        .subscribe(() => {
          this.router.navigate(['/rutinas', this.rutinaId]);
        });
      return;
    }

    const draft = this.ejercicios();
    this.rutinasService
      .crear({
        nombre: this.nombre().trim(),
        descripcion: this.descripcion.trim() || null,
        grupos: this.gruposSeleccionados(),
      })
      .pipe(
        switchMap((rutina) =>
          from(draft).pipe(
            concatMap((ej, i) =>
              this.rutinasService.agregarEjercicio(rutina.id, {
                ejercicio_id: ej.ejercicio_id,
                orden: i + 1,
                series_objetivo: ej.series_objetivo,
                reps_objetivo: ej.reps_objetivo,
              }),
            ),
            toArray(),
            catchError(() => of(null)),
            map(() => rutina),
          ),
        ),
      )
      .subscribe((rutina) => {
        this.router.navigate(['/rutinas', rutina.id]);
      });
  }
}
