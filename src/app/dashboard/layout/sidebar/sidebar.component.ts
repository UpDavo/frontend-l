import { Component, computed, input, output, signal, inject, effect } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';
import { Permission } from '../../../auth/services/auth/auth.models';
import { DASHBOARD_NAV, NavItem, NavSection } from '../../dashboard-nav.config';

export type { NavItem, NavSection };

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, DrawerModule, ButtonModule, TooltipModule],
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    private readonly router = inject(Router);

    /** Controla si el sidebar está colapsado (desktop: iconos, mobile: cerrado) */
    collapsed = input(false);

    /** Drawer móvil abierto */
    mobileOpen = input(false);

    /** Si el usuario es admin, ve todas las rutas sin filtro de permisos */
    isAdmin = input(false);

    /** Permisos del usuario logueado */
    permissions = input<Permission[]>([]);

    /** Emite cuando el usuario cierra el sidebar/drawer en móvil */
    closeSidebar = output<void>();

    /** Items expandidos (por label) */
    expandedItems = signal<Set<string>>(new Set());

    /** Secciones filtradas según permisos del usuario */
    sections = computed(() => {
        const admin = this.isAdmin();
        const perms = this.permissions();
        const permPaths = new Set(perms.map((p) => p.path));
        const hasPerm = (requiredPermission?: string) =>
            admin || !requiredPermission || permPaths.has(requiredPermission);

        return DASHBOARD_NAV
            .map((section) => ({
                ...section,
                items: section.items
                    .map((item) => {
                        if (!item.children?.length) return item;
                        return {
                            ...item,
                            children: item.children.filter((child) => hasPerm(child.requiredPermission)),
                        };
                    })
                    .filter((item) => {
                        const itemHasPerm = hasPerm(item.requiredPermission);
                        const hasVisibleChildren = !item.children || item.children.length > 0;
                        return itemHasPerm && hasVisibleChildren;
                    }),
            }))
            .filter((section) => section.items.length > 0);
    });

    constructor() {
        // Escuchar cambios de ruta y expandir automáticamente items padres
        effect(() => {
            // Dummy signal access para que el effect se reactive a cambios
            this.sections();

            // Expandir automáticamente el padre si estamos en una ruta hija
            setTimeout(() => this.expandParentIfNeeded(), 0);
        });

        // También escuchar NavigationEnd
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe(() => this.expandParentIfNeeded());
    }

    /** Detecta si la ruta actual es hija de algún item y lo expande */
    private expandParentIfNeeded(): void {
        const currentUrl = this.router.url;

        for (const section of this.sections()) {
            for (const item of section.items) {
                if (item.children) {
                    // Verificar si algún hijo coincide con la ruta actual
                    const hasMatchingChild = item.children.some(
                        (child) => child.route && currentUrl.startsWith(child.route)
                    );
                    if (hasMatchingChild) {
                        this.expandedItems.update((set) => new Set(set).add(item.label));
                    }
                }
            }
        }
    }

    toggleExpand(label: string): void {
        this.expandedItems.update((set) => {
            const next = new Set(set);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next;
        });
    }

    isExpanded(label: string): boolean {
        return this.expandedItems().has(label);
    }
}
