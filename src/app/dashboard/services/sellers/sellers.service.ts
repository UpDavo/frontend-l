import { Injectable, inject, signal } from '@angular/core';
import { SellersRepository, ReporteCliente, Vendedor, Cliente, ProductoSugerido } from '../../repositories/sellers.repository';

@Injectable({ providedIn: 'root' })
export class SellersService {
    private readonly repo = inject(SellersRepository);

    readonly vendedores      = signal<Vendedor[]>([]);
    readonly clientes        = signal<Cliente[]>([]);
    readonly loadingClientes = signal(false);
    readonly reporte         = signal<ReporteCliente | null>(null);
    readonly loading         = signal(false);
    readonly error           = signal<string | null>(null);

    readonly productos        = signal<ProductoSugerido[]>([]);
    readonly productosTotal   = signal(0);
    readonly productosLoading = signal(false);

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
        this.productos.set([]);
        this.productosTotal.set(0);
        this.repo.getReporte(clienteId).subscribe({
            next: (res) => { this.loading.set(false); this.reporte.set(res); },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.detail ?? 'Error al cargar el reporte del cliente');
            },
        });
    }

    loadProductos(clienteId: number, opts: { page?: number; page_size?: number; search?: string; ordering?: string } = {}): void {
        this.productosLoading.set(true);
        this.repo.getProductosSugeridos(clienteId, opts).subscribe({
            next: (res) => {
                this.productosLoading.set(false);
                this.productos.set(res.results);
                this.productosTotal.set(res.count);
            },
            error: () => { this.productosLoading.set(false); },
        });
    }

    reset(): void {
        this.clientes.set([]);
        this.reporte.set(null);
        this.error.set(null);
        this.productos.set([]);
        this.productosTotal.set(0);
    }
}
