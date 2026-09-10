import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rutina, RutinaDetalle } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RutinasService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Rutina[]> {
    return this.http.get<Rutina[]>(`${environment.apiUrl}/rutinas`);
  }

  obtener(id: string): Observable<RutinaDetalle> {
    return this.http.get<RutinaDetalle>(`${environment.apiUrl}/rutinas/${id}`);
  }
}
