import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth/auth.service';
import { map } from 'rxjs';

/**
 * Guard para rutas protegidas.
 * Si el usuario está autenticado, permite el acceso.
 * Si no, intenta refrescar el token. Si falla, redirige a /auth/login.
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    if (authService.isLoggingOut()) {
        return router.createUrlTree(['/auth/login']);
    }

    // Intentar refrescar el token con la cookie httpOnly
    return authService.refresh().pipe(
        map((response) => {
            if (response) {
                return true;
            }
            return router.createUrlTree(['/auth/login']);
        })
    );
};
