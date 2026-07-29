import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { PERM } from './dashboard-nav.config';
import { permissionGuard } from '../core/guards/permission.guard';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            // ─── Home ────────────────────────────────────────────────────────────
            {
                path: '',
                title: 'Dashboard',
                loadComponent: () =>
                    import('./pages/dashboard/dashboard.component').then((m) => m.LogeadoComponent),
            },

            // ─── Gestión de usuarios ──────────────────────────────────────────────
            {
                path: 'user',
                children: [
                    {
                        path: '',
                        title: 'Usuarios',
                        canActivate: [permissionGuard(PERM.USERS)],
                        loadComponent: () =>
                            import('./pages/users/user-list/user-list.component').then((m) => m.UserListComponent),
                    },
                    {
                        path: 'roles',
                        title: 'Roles',
                        canActivate: [permissionGuard(PERM.ROLES)],
                        loadComponent: () =>
                            import('./pages/users/role-list/role-list.component').then((m) => m.RoleListComponent),
                    },
                    {
                        path: 'permission',
                        title: 'Permisos',
                        canActivate: [permissionGuard(PERM.PERMISSIONS)],
                        loadComponent: () =>
                            import('./pages/users/permission-list/permission-list.component').then((m) => m.PermissionListComponent),
                    },
                ],
            },

            // ─── Cambiar Contraseña ───────────────────────────────────────────────
            {
                path: 'change-password',
                title: 'Cambiar Contraseña',
                loadComponent: () =>
                    import('./pages/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
            },

            // ─── Analítica ────────────────────────────────────────────────────────
            {
                path: 'analytics',
                children: [
                    {
                        path: 'ventas',
                        title: 'Ventas Diarias',
                        canActivate: [permissionGuard(PERM.ANALYTICS_VENTAS)],
                        loadComponent: () =>
                            import('./pages/analytics/under-construction/under-construction.component').then((m) => m.AnalyticsUnderConstructionComponent),
                        data: { title: 'Ventas Diarias' },
                    },
                    {
                        path: 'stock',
                        title: 'Stock Bodega',
                        canActivate: [permissionGuard(PERM.ANALYTICS_STOCK)],
                        loadComponent: () =>
                            import('./pages/analytics/under-construction/under-construction.component').then((m) => m.AnalyticsUnderConstructionComponent),
                        data: { title: 'Stock Bodega' },
                    },
                    {
                        path: 'importaciones',
                        title: 'Importaciones',
                        canActivate: [permissionGuard(PERM.ANALYTICS_IMPORTACIONES)],
                        loadComponent: () =>
                            import('./pages/analytics/under-construction/under-construction.component').then((m) => m.AnalyticsUnderConstructionComponent),
                        data: { title: 'Importaciones' },
                    },
                    {
                        path: 'movimiento',
                        title: 'Análisis de Movimiento',
                        canActivate: [permissionGuard(PERM.ANALYTICS_MOVIMIENTO)],
                        loadComponent: () =>
                            import('./pages/analytics/under-construction/under-construction.component').then((m) => m.AnalyticsUnderConstructionComponent),
                        data: { title: 'Análisis de Movimiento' },
                    },
                ],
            },

            // ─── Vendedores ───────────────────────────────────────────────────────
            {
                path: 'sellers',
                children: [
                    {
                        path: 'report',
                        title: 'Reporte de Vendedores',
                        canActivate: [permissionGuard(PERM.SELLERS_REPORT)],
                        loadComponent: () =>
                            import('./pages/sellers/report/report.component').then((m) => m.SellersReportComponent),
                    },
                    {
                        path: 'carga-data',
                        title: 'Cargar Data de Vendedores',
                        canActivate: [permissionGuard(PERM.SELLERS_CARGA_DATA)],
                        loadComponent: () =>
                            import('./pages/sellers/carga-data/carga-data.component').then((m) => m.SellersCargaDataComponent),
                    },
                ],
            },

            // ─── Sin permiso ──────────────────────────────────────────────────────
            {
                path: 'unauthorized',
                title: 'No autorizado',
                loadComponent: () =>
                    import('./pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
            },
        ],
    },
];
