import {
    Component,
    OnDestroy,
    effect,
    input,
    output,
    signal,
} from '@angular/core';

import { Dialog } from 'primeng/dialog';

export interface SuccessDialogData {
    message: string;
    warning?: string;
    /** La tarjeta de sellos se completó */
    cardCompleted?: boolean;
    /** Se canjeó una recompensa */
    redeemed?: boolean;
    /** Progreso actual (sellos / puntos) */
    currentProgress?: number;
    /** Meta total (sellos / puntos) */
    targetProgress?: number;
}

/**
 * SuccessDialogComponent — modal de éxito reutilizable.
 *
 * Muestra un dialog con ícono, título, mensaje, barra de progreso
 * y un countdown que al llegar a 0 emite el evento `closed`.
 *
 * Uso:
 * <app-success-dialog
 *   [visible]="visible()"
 *   [data]="data()"
 *   [countdownSeconds]="3"
 *   (closed)="onClose()"
 * />
 */
@Component({
    selector: 'app-success-dialog',
    standalone: true,
    imports: [Dialog],
    template: `
        <p-dialog
            [visible]="visible()"
            (visibleChange)="onClose()"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '420px' }"
            [showHeader]="false"
        >
            @if (data(); as d) {
                <div class="flex flex-col items-center text-center py-4 gap-4">
                    <!-- Ícono -->
                    <div
                        class="w-20 h-20 rounded-full flex items-center justify-center"
                        [class]="d.redeemed ? 'bg-brand/10' : d.cardCompleted ? 'bg-amber-100' : 'bg-green-100'"
                    >
                        @if (d.redeemed) {
                            <i class="pi pi-gift text-4xl text-brand"></i>
                        } @else if (d.cardCompleted) {
                            <i class="pi pi-star-fill text-4xl text-amber-500"></i>
                        } @else {
                            <i class="pi pi-check-circle text-4xl text-green-500"></i>
                        }
                    </div>

                    <!-- Título -->
                    <h2 class="text-xl font-bold text-gray-800">
                        {{ d.redeemed ? '¡Recompensa canjeada!' : d.cardCompleted ? '¡Tarjeta completada!' : '¡Operación exitosa!' }}
                    </h2>

                    <!-- Mensaje -->
                    <p class="text-sm text-gray-600">{{ d.message }}</p>

                    <!-- Barra de progreso -->
                    @if (d.currentProgress != null && d.targetProgress != null) {
                        <div class="w-full px-2">
                            <div class="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progreso actualizado</span>
                                <span class="font-semibold text-brand">
                                    {{ d.currentProgress }} / {{ d.targetProgress }}
                                </span>
                            </div>
                            <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    class="h-full rounded-full transition-all duration-700"
                                    [class]="d.cardCompleted ? 'bg-green-500' : 'bg-brand'"
                                    [style.width.%]="(d.currentProgress / d.targetProgress) * 100"
                                ></div>
                            </div>
                        </div>
                    }

                    <!-- Warning -->
                    @if (d.warning) {
                        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 w-full text-left">
                            <i class="pi pi-exclamation-triangle text-amber-500 mt-0.5"></i>
                            <span class="text-sm text-amber-800">{{ d.warning }}</span>
                        </div>
                    }

                    <!-- Countdown -->
                    <p class="text-xs text-gray-400">
                        Volviendo en {{ countdown() }}s...
                    </p>
                </div>
            }
        </p-dialog>
    `,
})
export class SuccessDialogComponent implements OnDestroy {
    /** Datos a mostrar en el dialog */
    readonly data = input<SuccessDialogData | null>(null);

    /** Controla la visibilidad desde el padre */
    readonly visible = input(false);

    /** Segundos de espera antes de emitir `closed` (por defecto 2) */
    readonly countdownSeconds = input(2);

    /** Emitido cuando el countdown llega a 0 o el usuario cierra */
    readonly closed = output<void>();

    readonly countdown = signal(2);
    private interval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Inicia o detiene el countdown según visibilidad
        effect(() => {
            if (this.visible()) {
                this.startCountdown();
            } else {
                this.clearInterval();
            }
        });
    }

    private startCountdown(): void {
        this.clearInterval();
        this.countdown.set(this.countdownSeconds());
        this.interval = setInterval(() => {
            const next = this.countdown() - 1;
            this.countdown.set(next);
            if (next <= 0) {
                this.clearInterval();
                this.closed.emit();
            }
        }, 1000);
    }

    private clearInterval(): void {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    onClose(): void {
        this.clearInterval();
        this.closed.emit();
    }

    ngOnDestroy(): void {
        this.clearInterval();
    }
}
