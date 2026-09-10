import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const RUTAS_PUBLICAS = ['/auth/registro', '/auth/login', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esRutaAuth = req.url.includes('/auth/');
  // /auth/logout, a diferencia del resto de /auth/*, sí exige Authorization —
  // el backend lo usa para identificar la sesión a invalidar.
  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));
  const token = auth.obtenerAccessToken();

  const reqConToken =
    token && !esRutaPublica
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Un 401 fuera de /auth/* significa access_token vencido — se intenta
      // refrescar una vez y reintentar la misma petición con el token nuevo.
      if (error.status === 401 && !esRutaAuth) {
        return auth.refrescar().pipe(
          switchMap(() => {
            const reintento = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.obtenerAccessToken()}` },
            });
            return next(reintento);
          }),
          catchError((errorRefresh) => {
            auth.limpiarSesion();
            return throwError(() => errorRefresh);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
