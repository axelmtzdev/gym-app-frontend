import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NuevaSerie, ResumenSesion, Sesion } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SesionesService {
  private readonly http = inject(HttpClient);

  crear(rutinaId: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/sesiones`, { rutina_id: rutinaId });
  }

  actualizar(
    sesionId: string,
    cambios: { estado?: 'completada' | 'abandonada'; nota_general?: string },
  ): Observable<Sesion> {
    return this.http.patch<Sesion>(`${environment.apiUrl}/sesiones/${sesionId}`, cambios);
  }

  resumen(sesionId: string): Observable<ResumenSesion> {
    return this.http.get<ResumenSesion>(`${environment.apiUrl}/sesiones/${sesionId}/resumen`);
  }

  registrarSerie(sesionId: string, serie: NuevaSerie): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/sesiones/${sesionId}/series`, serie);
  }
}
