import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ejercicio, HistorialEjercicio, ReferenciaEjercicio } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EjerciciosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(`${environment.apiUrl}/ejercicios`);
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
