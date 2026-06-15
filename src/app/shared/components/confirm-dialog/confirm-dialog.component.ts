import { Component, input, output } from '@angular/core';

import { Dialog } from 'primeng/dialog';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

/**
 * ConfirmDialogComponent — modal de confirmación reutilizable.
 *
 * Uso:
 * <app-confirm-dialog
 *   [visible]="show()"
 *   title="Desactivar tienda"
 *   message="¿Estás seguro de que deseas desactivar esta tienda?"
 *   confirmLabel="Desactivar"
 *   variant="danger"
 *   (confirmed)="onConfirm()"
 *   (cancelled)="show.set(false)"
 * />
 */
@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    host: { style: 'display: contents' },
    imports: [Dialog],
    template: `
        @if (visible()) {
        <p-dialog
            [visible]="visible()"
            (visibleChange)="onCancel()"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '420px' }"
            [showHeader]="false"
        >
            <div class="flex flex-col items-center text-center py-4 gap-5">
                <!-- Ícono -->
                <div
                    class="w-16 h-16 rounded-full flex items-center justify-center"
                    [class]="iconBg()">
                    <i class="text-3xl" [class]="iconClass()"></i>
                </div>

                <!-- Título -->
                <div class="space-y-1.5">
                    <h2 class="text-lg font-bold text-gray-800">{{ title() }}</h2>
                    <p class="text-sm text-gray-500 leading-relaxed">{{ message() }}</p>
                </div>

                <!-- Acciones -->
                <div class="flex gap-3 w-full pt-1">
                    <button
                        type="button"
                        class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        (click)="onCancel()">
                        {{ cancelLabel() }}
                    </button>
                    <button
                        type="button"
                        class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                        [class]="confirmBtnClass()"
                        (click)="onConfirm()">
                        {{ confirmLabel() }}
                    </button>
                </div>
            </div>
        </p-dialog>
        }
    `,
})
export class ConfirmDialogComponent {
    readonly visible = input(false);
    readonly title = input('¿Estás seguro?');
    readonly message = input('Esta acción no se puede deshacer.');
    readonly confirmLabel = input('Confirmar');
    readonly cancelLabel = input('Cancelar');
    readonly variant = input<ConfirmDialogVariant>('warning');

    readonly confirmed = output<void>();
    readonly cancelled = output<void>();

    readonly iconBg = () => {
        const v = this.variant();
        if (v === 'danger') return 'bg-red-100';
        if (v === 'warning') return 'bg-amber-100';
        return 'bg-blue-100';
    };

    readonly iconClass = () => {
        const v = this.variant();
        if (v === 'danger') return 'pi pi-trash text-red-500';
        if (v === 'warning') return 'pi pi-exclamation-triangle text-amber-500';
        return 'pi pi-info-circle text-blue-500';
    };

    readonly confirmBtnClass = () => {
        const v = this.variant();
        if (v === 'danger') return 'bg-red-500 hover:bg-red-600';
        if (v === 'warning') return 'bg-amber-500 hover:bg-amber-600';
        return 'bg-blue-500 hover:bg-blue-600';
    };

    onConfirm(): void {
        this.confirmed.emit();
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
