import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { aSnakeCase } from '../utils/case.util';
import {
  ActualizarEjercicioPayload,
  CrearEjercicioPayload,
  Ejercicio,
  HistorialEjercicio,
  ReferenciaEjercicio,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EjerciciosService {
  private readonly http = inject(HttpClient);

  listar(grupos?: string[]): Observable<Ejercicio[]> {
    const params: Record<string, string> = grupos?.length ? { grupos: grupos.join(',') } : {};
    return this.http
      .get<unknown[]>(`${environment.apiUrl}/ejercicios`, { params })
      .pipe(map((lista) => aSnakeCase<Ejercicio[]>(lista)));
  }

  crear(payload: CrearEjercicioPayload): Observable<Ejercicio> {
    return this.http
      .post<unknown>(`${environment.apiUrl}/ejercicios`, payload)
      .pipe(map((ej) => aSnakeCase<Ejercicio>(ej)));
  }

  actualizar(id: number, payload: ActualizarEjercicioPayload): Observable<Ejercicio> {
    return this.http
      .patch<unknown>(`${environment.apiUrl}/ejercicios/${id}`, payload)
      .pipe(map((ej) => aSnakeCase<Ejercicio>(ej)));
  }

  referencia(ejercicioId: number, excluirSesion?: string): Observable<ReferenciaEjercicio> {
    const params: Record<string, string> = excluirSesion ? { excluir_sesion: excluirSesion } : {};
    return this.http.get<ReferenciaEjercicio>(
      `${environment.apiUrl}/ejercicios/${ejercicioId}/referencia`,
      { params },
    );
  }

  historial(ejercicioId: number): Observable<HistorialEjercicio> {
    return this.http.get<HistorialEjercicio>(
      `${environment.apiUrl}/ejercicios/${ejercicioId}/historial`,
    );
  }
}
