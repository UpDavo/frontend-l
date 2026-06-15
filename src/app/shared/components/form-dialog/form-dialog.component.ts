import { Component, input, output } from '@angular/core';

import { Dialog } from 'primeng/dialog';

/**
 * FormDialogComponent — modal de formulario reutilizable.
 *
 * El contenido del cuerpo se proyecta con ng-content.
 *
 * Uso:
 * <app-form-dialog
 *   [visible]="show()"
 *   title="Reasignar cajero"
 *   confirmLabel="Guardar"
 *   [confirmDisabled]="!selectedId()"
 *   [isLoading]="loading()"
 *   (confirmed)="onConfirm()"
 *   (cancelled)="show.set(false)">
 *
 *   <!-- Cuerpo del formulario proyectado aquí -->
 *   <select ...></select>
 *
 * </app-form-dialog>
 */
@Component({
    selector: 'app-form-dialog',
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
            [style]="{ width: '90vw', maxWidth: '440px' }"
            [showHeader]="false"
        >
            <div class="flex flex-col gap-5 py-3">

                <!-- Título -->
                <div class="flex items-center gap-3">
                    <h2 class="text-base font-bold text-gray-800">{{ title() }}</h2>
                </div>

                <!-- Cuerpo proyectado -->
                <ng-content />

                <!-- Acciones -->
                <div class="flex gap-3 pt-1">
                    <button
                        type="button"
                        class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        [disabled]="isLoading()"
                        (click)="onCancel()">
                        {{ cancelLabel() }}
                    </button>
                    <button
                        type="button"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                        [disabled]="confirmDisabled() || isLoading()"
                        (click)="onConfirm()">
                        @if (isLoading()) {
                            <i class="pi pi-spinner pi-spin text-sm"></i>
                        }
                        {{ confirmLabel() }}
                    </button>
                </div>
            </div>
        </p-dialog>
        }
    `,
})
export class FormDialogComponent {
    readonly visible = input(false);
    readonly title = input('');
    readonly confirmLabel = input('Guardar');
    readonly cancelLabel = input('Cancelar');
    readonly confirmDisabled = input(false);
    readonly isLoading = input(false);

    readonly confirmed = output<void>();
    readonly cancelled = output<void>();

    onConfirm(): void { this.confirmed.emit(); }
    onCancel(): void { this.cancelled.emit(); }
}
