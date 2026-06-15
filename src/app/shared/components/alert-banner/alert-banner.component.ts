import { Component, input, output } from '@angular/core';


export type AlertType = 'success' | 'warning' | 'error' | 'info';

/**
 * AlertBannerComponent — banner de alerta reutilizable.
 *
 * Uso:
 * <app-alert-banner type="error" [message]="msg" (dismissed)="msg = null" />
 *
 * Si no se necesita botón de cierre, omite el binding (dismissed).
 */
@Component({
    selector: 'app-alert-banner',
    standalone: true,
    imports: [],
    template: `
        @if (message()) {
            <div class="flex items-center gap-3 rounded-xl px-4 py-3 border"
                [class]="styles[type()].wrapper"
            >
                <i class="text-lg" [class]="styles[type()].icon"></i>
                <span class="text-sm font-medium">{{ message() }}</span>
                <button
                    class="ml-auto pi pi-times"
                    [class]="styles[type()].close"
                    (click)="dismissed.emit()"
                ></button>
            </div>
        }
    `,
})
export class AlertBannerComponent {
    readonly type    = input<AlertType>('info');
    readonly message = input<string | null>(null);

    readonly dismissed = output<void>();

    readonly styles: Record<AlertType, { wrapper: string; icon: string; close: string }> = {
        success: {
            wrapper: 'bg-green-50 border-green-200 text-green-800',
            icon:    'pi pi-check-circle text-green-600',
            close:   'text-green-600 hover:text-green-800',
        },
        warning: {
            wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
            icon:    'pi pi-exclamation-triangle text-amber-500',
            close:   'text-amber-600 hover:text-amber-800',
        },
        error: {
            wrapper: 'bg-red-50 border-red-200 text-red-800',
            icon:    'pi pi-times-circle text-red-500',
            close:   'text-red-600 hover:text-red-800',
        },
        info: {
            wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
            icon:    'pi pi-info-circle text-blue-500',
            close:   'text-blue-600 hover:text-blue-800',
        },
    };
}
