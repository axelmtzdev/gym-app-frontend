import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type ModoAcceso = 'login' | 'signup';

interface Errores {
  nombre?: string;
  email?: string;
  contrasena?: string;
  confirmarContrasena?: string;
}

@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-ink p-6">
      <div class="w-full max-w-sm space-y-6">
        <div class="space-y-1">
          <h1 class="font-display text-2xl font-extrabold text-chalk">
            {{ modo() === 'login' ? 'Inicia sesión' : 'Crea tu cuenta' }}
          </h1>
          <p class="text-sm text-chalk-dim">Para llevar tu progreso y el de tus amigos</p>
        </div>

        <div class="flex gap-1 rounded-lg bg-surface-2 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="modo() === 'login'"
            class="flex-1 rounded-md py-2 text-sm font-semibold transition-colors focus-visible:outline-offset-[-2px]"
            [class]="modo() === 'login' ? 'bg-iron text-iron-ink' : 'text-chalk-dim hover:text-chalk'"
            (click)="cambiarModo('login')"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="modo() === 'signup'"
            class="flex-1 rounded-md py-2 text-sm font-semibold transition-colors focus-visible:outline-offset-[-2px]"
            [class]="modo() === 'signup' ? 'bg-iron text-iron-ink' : 'text-chalk-dim hover:text-chalk'"
            (click)="cambiarModo('signup')"
          >
            Crear cuenta
          </button>
        </div>

        <form class="space-y-3" (submit)="$event.preventDefault(); enviar()" novalidate>
          @if (modo() === 'signup') {
            <div>
              <label for="nombre" class="mb-1 block text-xs font-medium text-chalk-dim">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                autocomplete="name"
                class="w-full rounded-lg border px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 transition-colors focus:outline-none"
                [class]="errores().nombre ? 'border-alert bg-surface-2' : 'border-steel bg-surface-2 focus:border-iron'"
                [attr.aria-invalid]="!!errores().nombre"
                [(ngModel)]="nombre"
                name="nombre"
                (blur)="tocado.nombre = true; validar()"
              />
              @if (errores().nombre) {
                <p class="mt-1 text-xs font-medium text-alert">{{ errores().nombre }}</p>
              }
            </div>
          }

          <div>
            <label for="email" class="mb-1 block text-xs font-medium text-chalk-dim">Correo</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              autocomplete="email"
              class="w-full rounded-lg border px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 transition-colors focus:outline-none"
              [class]="errores().email ? 'border-alert bg-surface-2' : 'border-steel bg-surface-2 focus:border-iron'"
              [attr.aria-invalid]="!!errores().email"
              [(ngModel)]="email"
              name="email"
              (blur)="tocado.email = true; validar()"
            />
            @if (errores().email) {
              <p class="mt-1 text-xs font-medium text-alert">{{ errores().email }}</p>
            }
          </div>

          <div>
            <label for="contrasena" class="mb-1 block text-xs font-medium text-chalk-dim">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="••••••••"
              [autocomplete]="modo() === 'login' ? 'current-password' : 'new-password'"
              class="w-full rounded-lg border px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 transition-colors focus:outline-none"
              [class]="errores().contrasena ? 'border-alert bg-surface-2' : 'border-steel bg-surface-2 focus:border-iron'"
              [attr.aria-invalid]="!!errores().contrasena"
              [(ngModel)]="contrasena"
              name="contrasena"
              (blur)="tocado.contrasena = true; validar()"
            />
            @if (errores().contrasena) {
              <p class="mt-1 text-xs font-medium text-alert">{{ errores().contrasena }}</p>
            }
          </div>

          @if (modo() === 'signup') {
            <div>
              <label for="confirmar" class="mb-1 block text-xs font-medium text-chalk-dim">
                Confirmar contraseña
              </label>
              <input
                id="confirmar"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                class="w-full rounded-lg border px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 transition-colors focus:outline-none"
                [class]="errores().confirmarContrasena ? 'border-alert bg-surface-2' : 'border-steel bg-surface-2 focus:border-iron'"
                [attr.aria-invalid]="!!errores().confirmarContrasena"
                [(ngModel)]="confirmarContrasena"
                name="confirmarContrasena"
                (blur)="tocado.confirmarContrasena = true; validar()"
              />
              @if (errores().confirmarContrasena) {
                <p class="mt-1 text-xs font-medium text-alert">{{ errores().confirmarContrasena }}</p>
              }
            </div>
          }

          @if (errorServidor()) {
            <p class="text-sm font-medium text-alert" role="alert">{{ errorServidor() }}</p>
          }

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-iron py-3 text-sm font-bold text-iron-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            [disabled]="enviando()"
          >
            @if (enviando()) {
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-iron-ink/30 border-t-iron-ink"
                aria-hidden="true"
              ></span>
            }
            {{ modo() === 'login' ? 'Entrar' : 'Crear cuenta' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AccesoComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly modo = signal<ModoAcceso>('login');
  readonly enviando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly errores = signal<Errores>({});

  nombre = '';
  email = '';
  contrasena = '';
  confirmarContrasena = '';

  tocado: Record<keyof Errores, boolean> = {
    nombre: false,
    email: false,
    contrasena: false,
    confirmarContrasena: false,
  };

  cambiarModo(modo: ModoAcceso): void {
    this.modo.set(modo);
    this.errorServidor.set(null);
    this.errores.set({});
    this.tocado = { nombre: false, email: false, contrasena: false, confirmarContrasena: false };
  }

  validar(): boolean {
    const errores: Errores = {};
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);

    if (this.modo() === 'signup' && !this.nombre.trim() && this.tocado.nombre) {
      errores.nombre = 'Escribe tu nombre.';
    }
    if (this.tocado.email) {
      if (!this.email) errores.email = 'El correo es obligatorio.';
      else if (!emailValido) errores.email = 'Escribe un correo válido.';
    }
    if (this.tocado.contrasena) {
      if (!this.contrasena) errores.contrasena = 'La contraseña es obligatoria.';
      else if (this.modo() === 'signup' && this.contrasena.length < 8) {
        errores.contrasena = 'Necesita al menos 8 caracteres.';
      }
    }
    if (this.modo() === 'signup' && this.tocado.confirmarContrasena) {
      if (this.confirmarContrasena !== this.contrasena) {
        errores.confirmarContrasena = 'Las contraseñas no coinciden.';
      }
    }

    this.errores.set(errores);
    return Object.keys(errores).length === 0;
  }

  enviar(): void {
    this.errorServidor.set(null);
    this.tocado.email = true;
    this.tocado.contrasena = true;
    if (this.modo() === 'signup') {
      this.tocado.nombre = true;
      this.tocado.confirmarContrasena = true;
    }

    if (!this.validar()) return;

    this.enviando.set(true);
    const peticion =
      this.modo() === 'login'
        ? this.auth.login(this.email, this.contrasena)
        : this.auth.registro(this.nombre, this.email, this.contrasena);

    peticion.subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => {
        this.enviando.set(false);
        this.errorServidor.set('Correo o contraseña incorrectos.');
      },
    });
  }
}
