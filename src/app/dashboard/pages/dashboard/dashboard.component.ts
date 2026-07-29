import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '../../../core/store/auth.store';
import { PERM } from '../../dashboard-nav.config';

@Component({
    selector: 'app-logeado',
    standalone: true,
    templateUrl: './dashboard.component.html',
})
export class LogeadoComponent {
    private readonly authStore = inject(AuthStore);

    readonly canViewVentas = computed(() => this.hasPermission(PERM.ANALYTICS_VENTAS));
    readonly canViewStock = computed(() => this.hasPermission(PERM.ANALYTICS_STOCK));
    readonly canViewImportaciones = computed(() => this.hasPermission(PERM.ANALYTICS_IMPORTACIONES));
    readonly canViewMovimiento = computed(() => this.hasPermission(PERM.ANALYTICS_MOVIMIENTO));
    readonly hasAnalyticsAccess = computed(() =>
        this.canViewVentas() || this.canViewStock() || this.canViewImportaciones() || this.canViewMovimiento()
    );

    private hasPermission(permission: string): boolean {
        return this.authStore.isAdmin()
            || this.authStore.permissions().some((item) => item.path === permission);
    }
}
