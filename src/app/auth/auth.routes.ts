import { Routes } from '@angular/router';
import { noAuthGuard } from '../core/guards/no-auth.guard';
import { AuthLayoutComponent } from './layout/auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        title: 'Iniciar Sesión',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
        canActivate: [noAuthGuard],
      },
      {
        path: 'forgot-password',
        title: 'Recuperar Contraseña',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        title: 'Nueva Contraseña',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
