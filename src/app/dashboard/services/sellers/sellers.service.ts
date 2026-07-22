import { Injectable, inject, signal } from '@angular/core';
import { SellersRepository, ReporteCliente, Vendedor, Cliente, ProductoMarca } from '../../repositories/sellers.repository';

@Injectable({ providedIn: 'root' })
export class SellersService {
    private readonly repo = inject(SellersRepository);

    readonly vendedores      = signal<Vendedor[]>([]);
    readonly clientes        = signal<Cliente[]>([]);
    readonly loadingClientes = signal(false);
    readonly reporte         = signal<ReporteCliente | null>(null);
    readonly loading         = signal(false);
    readonly error           = signal<string | null>(null);

    readonly productosMarca        = signal<ProductoMarca[]>([]);
    readonly productosMarcaTotal   = signal(0);
    readonly productosMarcaLoading = signal(false);

    readonly topItemsMarca        = signal<ProductoMarca[]>([]);
    readonly topItemsMarcaLoading = signal(false);

    loadVendedores(): void {
        this.repo.getVendedores().subscribe({
            next: (res) => this.vendedores.set(res),
            error: () => {},
        });
    }

    loadClientes(vendedorId: number): void {
        this.clientes.set([]);
        this.loadingClientes.set(true);
        this.repo.getClientes(vendedorId).subscribe({
            next: (res) => { this.loadingClientes.set(false); this.clientes.set(res); },
            error: () => { this.loadingClientes.set(false); },
        });
    }

    loadReporte(clienteId: number): void {
        this.error.set(null);
        this.loading.set(true);
        this.reporte.set(null);
        this.resetProductosMarca();
        this.repo.getReporte(clienteId).subscribe({
            next: (res) => { this.loading.set(false); this.reporte.set(res); },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.detail ?? 'Error al cargar el reporte del cliente');
            },
        });
    }

    loadProductosMarca(
        clienteId: number,
        marcaId: number,
        opts: { page?: number; page_size?: number; search?: string; ordering?: string } = {},
    ): void {
        this.productosMarcaLoading.set(true);
        this.repo.getProductosMarca(clienteId, marcaId, opts).subscribe({
            next: (res) => {
                this.productosMarcaLoading.set(false);
                this.productosMarca.set(res.results);
                this.productosMarcaTotal.set(res.count);
            },
            error: () => { this.productosMarcaLoading.set(false); },
        });
    }

    loadTopItemsMarca(clienteId: number, marcaId: number, topN: number): void {
        this.topItemsMarcaLoading.set(true);
        this.repo.getProductosMarca(clienteId, marcaId, { page: 1, page_size: topN, ordering: '-total_cantidad' }).subscribe({
            next: (res) => { this.topItemsMarcaLoading.set(false); this.topItemsMarca.set(res.results); },
            error: () => { this.topItemsMarcaLoading.set(false); },
        });
    }

    resetProductosMarca(): void {
        this.productosMarca.set([]);
        this.productosMarcaTotal.set(0);
        this.topItemsMarca.set([]);
    }

    reset(): void {
        this.clientes.set([]);
        this.reporte.set(null);
        this.error.set(null);
        this.resetProductosMarca();
    }
}
