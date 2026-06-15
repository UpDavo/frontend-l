import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CoreModule — Módulo central de la aplicación.
 *
 * Contiene:
 * - Guards:       auth.guard, no-auth.guard
 * - Interceptors: auth.interceptor
 *
 * Todos los guards e interceptors son funcionales (CanActivateFn / HttpInterceptorFn)
 * y se registran directamente en app.config.ts / app.routes.ts.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }
