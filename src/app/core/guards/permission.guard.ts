import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

/**
 * Guard de permisos por ruta.
 *
 * Uso en routes:
 *   canActivate: [permissionGuard('Tarjetas de Lealtad')]
 *
 * Si el usuario no tiene el permiso requerido → redirige a /dashboard.
 */
export function permissionGuard(requiredPermission: string): CanActivateFn {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);

    if (store.isAdmin()) return true;

    const hasPermission = store
      .permissions()
      .some((p) => p.path === requiredPermission);

    if (hasPermission) return true;

    return router.createUrlTree(['/dashboard/unauthorized']);
  };
}
