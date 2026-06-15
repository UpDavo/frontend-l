export const PERM = {
    USERS: '/users',
    ROLES: '/dashboard/user/roles',
    PERMISSIONS: '/dashboard/user/permission',
    ANALYTICS_VENTAS: '/analytics/ventas',
    ANALYTICS_STOCK: '/analytics/stock',
    ANALYTICS_IMPORTACIONES: '/analytics/importaciones',
    ANALYTICS_MOVIMIENTO: '/analytics/movimiento',
} as const;

export type PermissionKey = (typeof PERM)[keyof typeof PERM];

export interface NavItem {
    label: string;
    icon?: string;
    route?: string;
    children?: NavItem[];
    requiredPermission?: string;
    tourId?: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const DASHBOARD_NAV: NavSection[] = [
    {
        title: '',
        items: [
            { label: 'Inicio', icon: 'pi pi-home', route: '/dashboard', tourId: 'dashboard' },
        ],
    },
    {
        title: 'ANALÍTICA',
        items: [
            { label: 'Ventas Diarias', icon: 'pi pi-chart-line', route: '/dashboard/analytics/ventas', requiredPermission: PERM.ANALYTICS_VENTAS, tourId: 'analytics-ventas' },
            { label: 'Stock Bodega', icon: 'pi pi-box', route: '/dashboard/analytics/stock', requiredPermission: PERM.ANALYTICS_STOCK, tourId: 'analytics-stock' },
            { label: 'Importaciones', icon: 'pi pi-truck', route: '/dashboard/analytics/importaciones', requiredPermission: PERM.ANALYTICS_IMPORTACIONES, tourId: 'analytics-importaciones' },
            { label: 'Análisis Movimiento', icon: 'pi pi-calendar-clock', route: '/dashboard/analytics/movimiento', requiredPermission: PERM.ANALYTICS_MOVIMIENTO, tourId: 'analytics-movimiento' },
        ],
    },
    {
        title: 'AJUSTES',
        items: [
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                tourId: 'settings',
                children: [
                    { label: 'Usuarios', route: '/dashboard/user', requiredPermission: PERM.USERS },
                    { label: 'Roles', route: '/dashboard/user/roles', requiredPermission: PERM.ROLES },
                    { label: 'Permisos', route: '/dashboard/user/permission', requiredPermission: PERM.PERMISSIONS },
                ],
            },
        ],
    },
];
