import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';

/**
 * TextOkDialogComponent — modal que muestra un texto destacado (p. ej. una
 * contraseña generada) con botón de copia y un aviso informativo al pie.
 *
 * Uso:
 * <app-text-ok-dialog
 *   [visible]="show()"
 *   title="Contraseña reseteada"
 *   [subtitle]="result.message"
 *   [text]="result.new_password"
 *   tip="Comparte este valor ahora. No se volverá a mostrar."
 *   (closed)="show.set(false)"
 * />
 */
@Component({
    selector: 'app-text-ok-dialog',
    standalone: true,
    host: { style: 'display: contents' },
    imports: [CommonModule, Dialog],
    template: `
        @if (visible()) {
        <p-dialog
            [visible]="visible()"
            (visibleChange)="close()"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '420px' }"
            [showHeader]="false">
            <div class="flex flex-col items-center text-center py-4 gap-5">

                <!-- Ícono -->
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="pi text-3xl text-green-600" [ngClass]="icon()"></i>
                </div>

                <!-- Título + subtítulo -->
                <div class="space-y-1">
                    <h2 class="text-lg font-bold text-gray-800">{{ title() }}</h2>
                    @if (subtitle()) {
                    <p class="text-sm text-gray-500 leading-relaxed">{{ subtitle() }}</p>
                    }
                </div>

                <!-- Texto destacado + botón copiar -->
                <div class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span class="flex-1 font-mono text-lg font-bold tracking-widest text-gray-800 select-all break-all">
                        {{ text() }}
                    </span>
                    <button
                        class="shrink-0 p-2 rounded-lg transition-colors"
                        [class]="copied() ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-brand hover:bg-brand/10'"
                        [title]="copied() ? 'Copiado' : 'Copiar'"
                        (click)="copyText()">
                        <i class="pi text-sm" [ngClass]="copied() ? 'pi-check' : 'pi-copy'"></i>
                    </button>
                </div>

                <!-- Tip informativo -->
                @if (tip()) {
                <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full text-left">
                    <i class="pi pi-exclamation-triangle mr-1"></i>
                    {{ tip() }}
                </p>
                }

                <!-- Botón OK -->
                <button
                    class="w-full px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
                    (click)="close()">
                    {{ okLabel() }}
                </button>

            </div>
        </p-dialog>
        }
    `,
})
export class TextOkDialogComponent {
    readonly visible = input(false);
    readonly title = input('');
    readonly subtitle = input<string | null>(null);
    readonly text = input('');
    readonly tip = input<string | null>(null);
    readonly icon = input('pi-check-circle');
    readonly okLabel = input('Entendido');

    readonly closed = output<void>();

    readonly copied = signal(false);

    close(): void {
        this.copied.set(false);
        this.closed.emit();
    }

    copyText(): void {
        const value = this.text();
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        });
    }
}
