import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AuthModule — Módulo de autenticación.
 *
 * Contiene:
 * - Rutas:  auth.routes.ts  (lazy-loaded desde app.routes.ts)
 * - Vistas: pages/login/     → LoginComponent
 *
 * Los componentes son standalone y se cargan vía loadComponent en las rutas.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AuthModule { }
