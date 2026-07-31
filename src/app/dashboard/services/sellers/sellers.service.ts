import { Injectable, inject, signal } from '@angular/core';
import {
    SellersRepository,
    ReporteCliente,
    Vendedor,
    Cliente,
    ClienteVentaHistorica,
    ProductoMarca,
    CargaDataClienteBasico,
    CargaVendedorClientePreview,
    CargaClienteMarcaPreview,
    CargaProductosPreview,
} from '../../repositories/sellers.repository';

export interface CargaProductosEntry {
    clienteCodigo: string;
    clienteNombre: string;
    file: File;
    preview: CargaProductosPreview;
}

@Injectable({ providedIn: 'root' })
export class SellersService {
    private readonly repo = inject(SellersRepository);

    readonly vendedores      = signal<Vendedor[]>([]);
    readonly clientes        = signal<Cliente[]>([]);
    readonly loadingClientes = signal(false);
    readonly ventasHistoricasClientes = signal<ClienteVentaHistorica[]>([]);
    readonly loadingVentasHistoricas = signal(false);
    readonly reporte         = signal<ReporteCliente | null>(null);
    readonly loading         = signal(false);
    readonly error           = signal<string | null>(null);

    readonly productosMarca        = signal<ProductoMarca[]>([]);
    readonly productosMarcaTotal   = signal(0);
    readonly productosMarcaLoading = signal(false);

    readonly topItemsMarca        = signal<ProductoMarca[]>([]);
    readonly topItemsMarcaLoading = signal(false);

    // ── Wizard de carga de datos (por vendedor) ─────────────────────
    // Nada se persiste en BD hasta llamar `procesarTodo()`. Cada paso solo
    // sube el archivo a un endpoint de preview (solo lectura) y guarda el
    // File en memoria para reenviarlo al aplicar.
    // Modo 'nuevo': el paso 1 sube un archivo (vendedor+clientes aún no existen).
    // Modo 'existente': se elige un Vendedor ya guardado, sus clientes se leen de BD.
    readonly cargaModo = signal<'nuevo' | 'existente'>('nuevo');
    readonly cargaClientes = signal<CargaDataClienteBasico[]>([]);

    readonly cargaVendedoresExistentes = signal<Vendedor[]>([]);
    readonly cargaVendedorExistenteId  = signal<number | null>(null);
    readonly cargaVendedorExistenteLoading = signal(false);

    readonly cargaPaso1File     = signal<File | null>(null);
    readonly cargaPaso1Preview  = signal<CargaVendedorClientePreview | null>(null);
    readonly cargaPaso1Loading  = signal(false);
    readonly cargaPaso1Error    = signal<string | null>(null);

    readonly cargaPaso2File     = signal<File | null>(null);
    readonly cargaPaso2Preview  = signal<CargaClienteMarcaPreview | null>(null);
    readonly cargaPaso2Loading  = signal(false);
    readonly cargaPaso2Error    = signal<string | null>(null);

    readonly cargaPaso3Loading  = signal(false);
    readonly cargaPaso3Error    = signal<string | null>(null);
    readonly cargaProductosEntries = signal<CargaProductosEntry[]>([]);

    // ── Procesamiento final (persistencia real, secuencial por etapas) ──
    readonly procesando      = signal(false);
    readonly procesoPasoActual = signal(0);
    readonly procesoTotalPasos = signal(0);
    readonly procesoEtiqueta = signal('');
    readonly procesoError    = signal<string | null>(null);
    readonly procesoOk       = signal(false);

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

    loadVentasHistoricasClientes(vendedorId: number): void {
        this.ventasHistoricasClientes.set([]);
        this.loadingVentasHistoricas.set(true);
        this.repo.getVentasHistoricasClientes(vendedorId).subscribe({
            next: (res) => {
                this.loadingVentasHistoricas.set(false);
                this.ventasHistoricasClientes.set(res);
            },
            error: (err) => {
                this.loadingVentasHistoricas.set(false);
                this.error.set(
                    err?.error?.detail ?? 'Error al cargar las ventas históricas de los clientes',
                );
            },
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
        opts: { page?: number; page_size?: number; search?: string; ordering?: string; meses_atras?: 3 | 6 | 12 } = {},
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

    descargarPlantillaCargaData(tipo: 'vendedor-cliente' | 'cliente-marca' | 'productos'): void {
        this.repo.descargarPlantillaCargaData(tipo).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `plantilla_${tipo}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
            },
            error: () => {
                this.cargaPaso1Error.set('No se pudo descargar la plantilla.');
            },
        });
    }

    elegirModo(modo: 'nuevo' | 'existente'): void {
        this.resetCargaData();
        this.cargaModo.set(modo);
        if (modo === 'existente' && !this.cargaVendedoresExistentes().length) {
            this.cargarVendedoresExistentes();
        }
    }

    cargarVendedoresExistentes(): void {
        this.cargaVendedorExistenteLoading.set(true);
        this.repo.getVendedores().subscribe({
            next: (res) => {
                this.cargaVendedorExistenteLoading.set(false);
                this.cargaVendedoresExistentes.set(res);
            },
            error: () => { this.cargaVendedorExistenteLoading.set(false); },
        });
    }

    seleccionarVendedorExistente(vendedorId: number | null): void {
        this.cargaVendedorExistenteId.set(vendedorId);
        this.cargaClientes.set([]);
        if (!vendedorId) return;
        this.cargaPaso1Loading.set(true);
        this.repo.getClientes(vendedorId).subscribe({
            next: (res) => {
                this.cargaPaso1Loading.set(false);
                this.cargaClientes.set(res.map((c) => ({ codigo: c.codigo, nombre: c.nombre })));
            },
            error: () => { this.cargaPaso1Loading.set(false); },
        });
    }

    previsualizarPaso1(file: File): void {
        this.cargaPaso1Loading.set(true);
        this.cargaPaso1Error.set(null);
        this.repo.previsualizarVendedorCliente(file).subscribe({
            next: (preview) => {
                this.cargaPaso1Loading.set(false);
                this.cargaPaso1File.set(file);
                this.cargaPaso1Preview.set(preview);
                this.cargaClientes.set(preview.clientes);
            },
            error: (err) => {
                this.cargaPaso1Loading.set(false);
                this.cargaPaso1Error.set(err?.error?.detail ?? 'Error al leer el archivo.');
            },
        });
    }

    quitarPaso1(): void {
        this.cargaPaso1File.set(null);
        this.cargaPaso1Preview.set(null);
        this.cargaClientes.set([]);
    }

    previsualizarPaso2(file: File): void {
        this.cargaPaso2Loading.set(true);
        this.cargaPaso2Error.set(null);
        this.repo.previsualizarClienteMarca(file).subscribe({
            next: (preview) => {
                this.cargaPaso2Loading.set(false);
                this.cargaPaso2File.set(file);
                this.cargaPaso2Preview.set(preview);
            },
            error: (err) => {
                this.cargaPaso2Loading.set(false);
                this.cargaPaso2Error.set(err?.error?.detail ?? 'Error al leer el archivo.');
            },
        });
    }

    quitarPaso2(): void {
        this.cargaPaso2File.set(null);
        this.cargaPaso2Preview.set(null);
    }

    previsualizarYAgregarProducto(file: File, clienteCodigo: string, clienteNombre: string): void {
        this.cargaPaso3Loading.set(true);
        this.cargaPaso3Error.set(null);
        this.repo.previsualizarProductos(file, clienteCodigo).subscribe({
            next: (preview) => {
                this.cargaPaso3Loading.set(false);
                this.cargaProductosEntries.update((lista) => [
                    ...lista.filter((e) => e.clienteCodigo !== clienteCodigo),
                    { clienteCodigo, clienteNombre, file, preview },
                ]);
            },
            error: (err) => {
                this.cargaPaso3Loading.set(false);
                this.cargaPaso3Error.set(err?.error?.detail ?? 'Error al leer el archivo.');
            },
        });
    }

    quitarProducto(clienteCodigo: string): void {
        this.cargaProductosEntries.update((lista) => lista.filter((e) => e.clienteCodigo !== clienteCodigo));
    }

    procesarTodo(onDone: () => void): void {
        const modoNuevo = this.cargaModo() === 'nuevo';
        const paso1 = this.cargaPaso1File();
        const paso2 = this.cargaPaso2File();
        const productos = this.cargaProductosEntries();
        if (modoNuevo && !paso1) return;
        if (!paso2 && !productos.length) return;

        const totalPasos = (modoNuevo ? 1 : 0) + (paso2 ? 1 : 0) + productos.length;
        this.procesando.set(true);
        this.procesoError.set(null);
        this.procesoOk.set(false);
        this.procesoTotalPasos.set(totalPasos);
        this.procesoPasoActual.set(0);

        const continuarConMarca = () => {
            if (!paso2) {
                this.procesarProductosSecuencial(productos, 0, onDone);
                return;
            }
            this.procesoEtiqueta.set('Guardando marcas y ventas anuales...');
            this.repo.aplicarClienteMarca(paso2).subscribe({
                next: () => {
                    this.procesoPasoActual.update((n) => n + 1);
                    this.procesarProductosSecuencial(productos, 0, onDone);
                },
                error: (err) => this.finalizarProcesoConError(err),
            });
        };

        if (modoNuevo && paso1) {
            this.procesoEtiqueta.set('Guardando vendedor y clientes...');
            this.repo.aplicarVendedorCliente(paso1).subscribe({
                next: () => {
                    this.procesoPasoActual.update((n) => n + 1);
                    continuarConMarca();
                },
                error: (err) => this.finalizarProcesoConError(err),
            });
        } else {
            continuarConMarca();
        }
    }

    private procesarProductosSecuencial(entries: CargaProductosEntry[], index: number, onDone: () => void): void {
        if (index >= entries.length) {
            this.procesando.set(false);
            this.procesoOk.set(true);
            onDone();
            return;
        }
        const entry = entries[index];
        this.procesoEtiqueta.set(`Guardando productos de ${entry.clienteNombre}...`);
        this.repo.aplicarProductos(entry.file, entry.clienteCodigo).subscribe({
            next: () => {
                this.procesoPasoActual.update((n) => n + 1);
                this.procesarProductosSecuencial(entries, index + 1, onDone);
            },
            error: (err) => this.finalizarProcesoConError(err),
        });
    }

    private finalizarProcesoConError(err: any): void {
        this.procesando.set(false);
        this.procesoError.set(err?.error?.detail ?? 'Error al guardar los datos.');
    }

    resetCargaData(): void {
        this.cargaModo.set('nuevo');
        this.cargaVendedorExistenteId.set(null);
        this.cargaClientes.set([]);
        this.cargaPaso1File.set(null);
        this.cargaPaso1Preview.set(null);
        this.cargaPaso1Loading.set(false);
        this.cargaPaso1Error.set(null);
        this.cargaPaso2File.set(null);
        this.cargaPaso2Preview.set(null);
        this.cargaPaso2Loading.set(false);
        this.cargaPaso2Error.set(null);
        this.cargaPaso3Loading.set(false);
        this.cargaPaso3Error.set(null);
        this.cargaProductosEntries.set([]);
        this.procesando.set(false);
        this.procesoPasoActual.set(0);
        this.procesoTotalPasos.set(0);
        this.procesoEtiqueta.set('');
        this.procesoError.set(null);
        this.procesoOk.set(false);
    }

    resetProductosMarca(): void {
        this.productosMarca.set([]);
        this.productosMarcaTotal.set(0);
        this.topItemsMarca.set([]);
    }

    reset(): void {
        this.clientes.set([]);
        this.ventasHistoricasClientes.set([]);
        this.loadingVentasHistoricas.set(false);
        this.reporte.set(null);
        this.error.set(null);
        this.resetProductosMarca();
    }
}
