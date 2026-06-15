import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth/auth.service';
import { map } from 'rxjs';

/**
 * Guard para rutas públicas (login, register, etc.).
 * Si el usuario YA está autenticado, redirige a /dashboard.
 * Si no, permite el acceso a la ruta pública.
 */
export const noAuthGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
    }

    if (authService.isLoggingOut()) {
        return true;
    }

    // Intentar refrescar por si hay cookie válida
    return authService.refresh().pipe(
        map((response) => {
            if (response) {
                return router.createUrlTree(['/dashboard']);
            }
            return true;
        })
    );
};
