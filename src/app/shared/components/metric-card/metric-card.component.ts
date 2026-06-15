import { Component, computed, input } from '@angular/core';


export interface MetricCardStat {
    label: string;
    value: number | string;
    color: string;
}

export interface MetricCardData {
    title: string;
    value: number | string;
    gradient: string;
    subtitle?: string;
    stats?: MetricCardStat[];
}

/** Mapeo de gradiente lógico → clases Tailwind */
const GRADIENT_MAP: Record<string, string> = {
    'primary-indigo': 'from-indigo-500 to-purple-600',
    'primary-blue': 'from-blue-500 to-cyan-600',
    'primary-green': 'from-emerald-500 to-teal-600',
    'emerald-teal': 'from-emerald-500 to-teal-600',
    'primary-orange': 'from-orange-500 to-amber-600',
    'primary-red': 'from-red-500 to-rose-600',
    'pink-purple': 'from-pink-500 to-purple-600',
    'indigo-purple': 'from-indigo-500 to-violet-600',
};

/**
 * MetricCardComponent — tarjeta de métrica reutilizable.
 *
 * Uso:
 * <app-metric-card [data]="metric" />
 */
@Component({
    selector: 'app-metric-card',
    standalone: true,
    imports: [],
    template: `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div class="p-4">
                <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {{ data().title }}
                </p>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ data().value }}</p>
                @if (data().subtitle) {
                    <p class="text-xs text-gray-400 mt-1">{{ data().subtitle }}</p>
                }
            </div>
            @if (data().stats && data().stats!.length) {
                <div class="px-4 pb-3 flex gap-4">
                    @for (stat of data().stats!; track stat.label) {
                        <span class="text-xs font-medium"
                            [class]="stat.color === 'success' ? 'text-green-600'
                                   : stat.color === 'danger'  ? 'text-red-500'
                                   : stat.color === 'info'    ? 'text-blue-500'
                                   : 'text-gray-500'">
                            <span class="font-bold">{{ stat.value }}</span> {{ stat.label }}
                        </span>
                    }
                </div>
            }
        </div>
    `,
})
export class MetricCardComponent {
    readonly data = input.required<MetricCardData>();

    readonly gradientClass = computed(
        () => GRADIENT_MAP[this.data().gradient] ?? 'from-brand to-brand-dark',
    );
}
