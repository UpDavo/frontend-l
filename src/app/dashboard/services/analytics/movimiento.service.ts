import { Injectable, inject, signal } from '@angular/core';
import {
    AnalyticsMovimientoRepository,
    HeatmapCell,
    HeatmapFilter,
    PronosticoFilter,
    PronosticoItem,
    TotalesGlobalesMes,
} from '../../repositories/analytics-movimiento.repository';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
    private readonly repo = inject(AnalyticsMovimientoRepository);

    readonly heatmap          = signal<HeatmapCell[]>([]);
    readonly pronostico       = signal<PronosticoItem[]>([]);
    readonly totalesGlobales  = signal<Record<string, TotalesGlobalesMes>>({});
    readonly loadingHeatmap   = signal(false);
    readonly loadingProno     = signal(false);
    readonly error            = signal<string | null>(null);

    loadHeatmap(f: HeatmapFilter = {}): void {
        this.error.set(null);
        this.loadingHeatmap.set(true);
        this.repo.getHeatmap(f).subscribe({
            next: (res) => { this.loadingHeatmap.set(false); this.heatmap.set(res); },
            error: () => { this.loadingHeatmap.set(false); this.error.set('Error al cargar heatmap'); },
        });
    }

    loadPronostico(f: PronosticoFilter = {}): void {
        this.error.set(null);
        this.loadingProno.set(true);
        this.repo.getPronostico(f).subscribe({
            next: (res) => { this.loadingProno.set(false); this.pronostico.set(res.results); this.totalesGlobales.set(res.totales_globales); },
            error: () => { this.loadingProno.set(false); this.error.set('Error al cargar pronóstico'); },
        });
    }
}
