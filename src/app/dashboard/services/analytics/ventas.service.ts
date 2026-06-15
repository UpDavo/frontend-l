import { Injectable, inject, signal } from '@angular/core';
import { AnalyticsVentasRepository, MetricasFilter, VentaMetricas, VentasFilter } from '../../repositories/analytics-ventas.repository';

@Injectable({ providedIn: 'root' })
export class VentasService {
    private readonly repo = inject(AnalyticsVentasRepository);

    readonly items    = signal<any[]>([]);
    readonly total    = signal(0);
    readonly loading  = signal(false);
    readonly error    = signal<string | null>(null);
    readonly success  = signal<string | null>(null);
    readonly ciudades  = signal<string[]>([]);
    readonly metricas  = signal<VentaMetricas | null>(null);

    private clear(): void {
        this.error.set(null);
        this.success.set(null);
    }

    loadCiudades(): void {
        this.repo.getCiudades().subscribe({
            next: (res) => this.ciudades.set(res),
            error: () => {},
        });
    }

    loadMetricas(f: MetricasFilter = {}): void {
        this.repo.getMetricas(f).subscribe({
            next: (res) => this.metricas.set(res),
            error: () => {},
        });
    }

    load(f: VentasFilter = {}): void {
        this.clear();
        this.loading.set(true);
        this.repo.list(f).subscribe({
            next: (res) => {
                this.loading.set(false);
                this.items.set(res.results ?? res);
                this.total.set(res.count ?? 0);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.detail ?? 'Error al cargar ventas');
            },
        });
    }

    create(body: any, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.create(body).subscribe({
            next: () => { this.loading.set(false); this.success.set('Venta creada'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al crear'); },
        });
    }

    update(id: number, body: any, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.update(id, body).subscribe({
            next: () => { this.loading.set(false); this.success.set('Venta actualizada'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al actualizar'); },
        });
    }

    delete(id: number, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.delete(id).subscribe({
            next: () => { this.loading.set(false); this.success.set('Venta eliminada'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al eliminar'); },
        });
    }
}
