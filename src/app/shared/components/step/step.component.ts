import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    trigger,
    state,
    style,
    transition,
    animate,
} from '@angular/animations';

@Component({
    selector: 'app-step',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './step.component.html',
    animations: [
        trigger('slideDown', [
            state('void', style({ height: '0', opacity: '0', overflow: 'hidden' })),
            state('*',    style({ height: '*', opacity: '1', overflow: 'hidden' })),
            transition('void <=> *', animate('220ms cubic-bezier(0.4, 0, 0.2, 1)')),
        ]),
    ],
})
export class StepComponent {
    /** Clase CSS del ícono PrimeIcons, ej. "pi pi-info-circle" */
    readonly icon = input.required<string>();

    /** Color de fondo del círculo del ícono, ej. "bg-gray-100" */
    readonly iconBg = input<string>('bg-gray-100');

    /** Color del ícono, ej. "text-gray-900" */
    readonly iconColor = input<string>('text-gray-500');

    /** Título del step */
    readonly title = input.required<string>();

    /** Marca el step como opcional */
    readonly optional = input<boolean>(false);

    /** Número para el badge (contador de items) */
    readonly badge = input<number | null>(null);

    /** Color del badge, ej. "bg-amber-100 text-amber-700" */
    readonly badgeColor = input<string>('bg-gray-100 text-gray-600');

    /** Si el step está expandido */
    readonly expanded = input<boolean>(false);

    /** Emite cuando se hace click en el header del step */
    readonly toggle = output<void>();
}
