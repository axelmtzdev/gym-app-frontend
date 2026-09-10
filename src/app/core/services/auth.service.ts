import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario } from '../models/api.models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USUARIO_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly usuarioSignal = signal<Usuario | null>(this.leerUsuarioGuardado());

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly autenticado = computed(() => this.usuarioSignal() !== null);

  registro(nombre: string, email: string, contrasena: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, { nombre, email, contrasena })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  login(email: string, contrasena: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, contrasena })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  // Usado por el interceptor cuando un access_token expira a media petición.
  refrescar(): Observable<AuthResponse> {
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refresh_token })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout(): void {
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);
    // El backend invalida la sesión de forma silenciosa incluso si el refresh_token
    // ya no es válido, y si la petición falla por red igual queremos deslogueado
    // al usuario localmente — por eso se limpia la sesión tanto en éxito como en error.
    this.http.post(`${environment.apiUrl}/auth/logout`, { refresh_token }).subscribe({
      complete: () => this.limpiarSesion(),
      error: () => this.limpiarSesion(),
    });
  }

  obtenerAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  limpiarSesion(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioSignal.set(null);
    this.router.navigateByUrl('/acceso');
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(res.usuario));
    this.usuarioSignal.set(res.usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(USUARIO_KEY);
    return guardado ? JSON.parse(guardado) : null;
  }
}
