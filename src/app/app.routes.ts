import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: '500',
    title: 'Error del servidor',
    loadComponent: () =>
      import('./shared/pages/server-error/server-error.component').then(
        (m) => m.ServerErrorComponent
      ),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
