import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor funcional que:
 * 1. Agrega el Bearer token a las peticiones (excepto login/refresh).
 * 2. Agrega withCredentials para enviar cookies automáticamente.
 * 3. Si recibe 401, intenta refrescar el token y reintentar la petición.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  // Clonar request con withCredentials para enviar cookies
  let authReq = req.clone({ withCredentials: true });

  // Agregar Bearer token si existe y no es endpoint de auth
  if (!isAuthEndpoint && authService.token) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es 401 y no es un endpoint de auth, intentar refrescar
      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap((response) => {
            if (response) {
              // Reintentar con el nuevo token
              const retryReq = req.clone({
                withCredentials: true,
                setHeaders: {
                  Authorization: `Bearer ${authService.token}`,
                },
              });
              return next(retryReq);
            }
            router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      }
      if (error.status === 403) {
        // Las rutas del escáner manejan el 403 como mensaje de error inline
        if (req.url.includes('/scanner/')) {
          return throwError(() => error);
        }
        router.navigate(['/dashboard/unauthorized']);
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
