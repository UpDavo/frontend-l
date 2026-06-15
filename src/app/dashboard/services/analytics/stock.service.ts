import { Injectable, inject, signal } from '@angular/core';
import { AnalyticsStockRepository, StockFilter } from '../../repositories/analytics-stock.repository';

@Injectable({ providedIn: 'root' })
export class StockService {
    private readonly repo = inject(AnalyticsStockRepository);

    readonly items    = signal<any[]>([]);
    readonly total    = signal(0);
    readonly loading  = signal(false);
    readonly error    = signal<string | null>(null);
    readonly success  = signal<string | null>(null);

    private clear(): void {
        this.error.set(null);
        this.success.set(null);
    }

    load(f: StockFilter = {}): void {
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
                this.error.set(err?.error?.detail ?? 'Error al cargar stock');
            },
        });
    }

    create(body: any, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.create(body).subscribe({
            next: () => { this.loading.set(false); this.success.set('Item creado'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al crear'); },
        });
    }

    update(id: number, body: any, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.update(id, body).subscribe({
            next: () => { this.loading.set(false); this.success.set('Item actualizado'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al actualizar'); },
        });
    }

    delete(id: number, done?: () => void): void {
        this.clear();
        this.loading.set(true);
        this.repo.delete(id).subscribe({
            next: () => { this.loading.set(false); this.success.set('Item eliminado'); done?.(); },
            error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Error al eliminar'); },
        });
    }
}
