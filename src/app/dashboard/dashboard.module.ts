import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * DashboardModule — Módulo del panel principal (rutas protegidas).
 *
 * Contiene:
 * - Rutas:  dashboard.routes.ts  (lazy-loaded, protegido por authGuard)
 * - Layout: layout/               → DashboardLayoutComponent
 * - Vistas: pages/logeado/        → LogeadoComponent
 *
 * Futuras sub-vistas:
 * - pages/user/    → gestión de usuarios
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DashboardModule { }
