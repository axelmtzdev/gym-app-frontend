import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { aSnakeCase } from '../utils/case.util';
import {
  ActualizarRutinaEjercicioPayload,
  ActualizarRutinaPayload,
  CrearRutinaEjercicioPayload,
  CrearRutinaPayload,
  Rutina,
  RutinaDetalle,
  RutinaEjercicioRow,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RutinasService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Rutina[]> {
    return this.http
      .get<unknown[]>(`${environment.apiUrl}/rutinas`)
      .pipe(map((lista) => aSnakeCase<Rutina[]>(lista)));
  }

  obtener(id: string): Observable<RutinaDetalle> {
    return this.http
      .get<unknown>(`${environment.apiUrl}/rutinas/${id}`)
      .pipe(map((r) => aSnakeCase<RutinaDetalle>(r)));
  }

  crear(payload: CrearRutinaPayload): Observable<Rutina> {
    return this.http
      .post<unknown>(`${environment.apiUrl}/rutinas`, payload)
      .pipe(map((r) => aSnakeCase<Rutina>(r)));
  }

  actualizar(id: string, payload: ActualizarRutinaPayload): Observable<Rutina> {
    return this.http
      .patch<unknown>(`${environment.apiUrl}/rutinas/${id}`, payload)
      .pipe(map((r) => aSnakeCase<Rutina>(r)));
  }

  agregarEjercicio(rutinaId: string, payload: CrearRutinaEjercicioPayload): Observable<RutinaEjercicioRow> {
    return this.http
      .post<unknown>(`${environment.apiUrl}/rutinas/${rutinaId}/ejercicios`, payload)
      .pipe(map((row) => aSnakeCase<RutinaEjercicioRow>(row)));
  }

  actualizarEjercicio(
    rutinaId: string,
    rutinaEjercicioId: number,
    payload: ActualizarRutinaEjercicioPayload,
  ): Observable<RutinaEjercicioRow> {
    return this.http
      .patch<unknown>(
        `${environment.apiUrl}/rutinas/${rutinaId}/ejercicios/${rutinaEjercicioId}`,
        payload,
      )
      .pipe(map((row) => aSnakeCase<RutinaEjercicioRow>(row)));
  }

  quitarEjercicio(rutinaId: string, rutinaEjercicioId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/rutinas/${rutinaId}/ejercicios/${rutinaEjercicioId}`,
    );
  }
}
