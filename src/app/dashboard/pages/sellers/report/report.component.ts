import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { SellersService } from '../../../services/sellers/sellers.service';
import { Cliente, MarcaVenta } from '../../../repositories/sellers.repository';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { MetricCardComponent, MetricCardData } from '../../../../shared/components/metric-card/metric-card.component';
import { BarChartComponent } from '../../../../shared/components/bar-chart/bar-chart.component';
import { SelectSearchComponent, SelectOption } from '../../../../shared/components/select-search/select-search.component';

const ANIOS = [2022, 2023, 2024, 2025, 2026];
const PRODUCTOS_PAGE_SIZE = 5;

// Paleta categórica validada (orden fijo, seguro para daltonismo) — un color por barra.
const CATEGORICAL_PALETTE = [
    '#2a78d6', '#eb6834', '#1baf7a', '#eda100',
    '#e87ba4', '#008300', '#4a3aa7', '#e34948',
];

function paletteColors(n: number): string[] {
    return Array.from({ length: n }, (_, i) => CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]);
}

@Component({
    selector: 'app-sellers-report',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule,
        FilterBarComponent, AlertBannerComponent,
        MetricCardComponent, BarChartComponent, SelectSearchComponent,
    ],
    templateUrl: './report.component.html',
})
export class SellersReportComponent implements OnInit, OnDestroy {
    readonly svc = inject(SellersService);

    fVendedorId = signal<number | null>(null);
    fClienteId  = signal<number | null>(null);
    fClientesSearch = signal('');
    fMarcasSearch = signal('');

    readonly vendedorOptions = computed<SelectOption[]>(
        () => this.svc.vendedores().map(v => ({ id: v.id, label: v.nombre })),
    );

    readonly clientesHistoricosLabels = computed(
        () => this.svc.ventasHistoricasClientes().map(
            cliente => `${cliente.nombre || 'Sin nombre'} · ${cliente.codigo}`,
        ),
    );
    readonly clientesHistoricosData = computed(
        () => this.svc.ventasHistoricasClientes().map(cliente => cliente.total_historico),
    );
    readonly totalHistoricoVendedor = computed(
        () => this.clientesHistoricosData().reduce((total, venta) => total + venta, 0),
    );
    readonly clientesFiltrados = computed(() => {
        const query = this.fClientesSearch().trim().toLocaleLowerCase('es');
        if (!query) return this.svc.clientes();
        return this.svc.clientes().filter(cliente =>
            [cliente.codigo, cliente.nombre, cliente.ciudad, cliente.provincia, cliente.zona]
                .some(value => String(value ?? '').toLocaleLowerCase('es').includes(query)),
        );
    });

    readonly anios = ANIOS;

    readonly resumenLabels = computed(
        () => this.svc.reporte()?.resumen_anual.map(r => String(r.anio)) ?? [],
    );
    readonly resumenData = computed(
        () => this.svc.reporte()?.resumen_anual.map(r => r.total_usd) ?? [],
    );
    readonly resumenColors = computed(() => paletteColors(this.resumenData().length));

    readonly clienteMetric = computed<MetricCardData | null>(() => {
        const r = this.svc.reporte();
        if (!r) return null;
        return {
            title: 'Ventas históricas totales',
            value: `$${r.marcas_compradas.reduce((s, m) => s + m.total_historico, 0).toLocaleString('es-EC', { maximumFractionDigits: 0 })}`,
            gradient: 'primary-black',
            subtitle: `${r.marcas_compradas.length} marca(s) compradas`,
        };
    });

    // ── Top N marcas ──────────────────────────────────────────────
    topN = signal<5 | 10>(5);

    readonly topMarcas = computed(
        () => (this.svc.reporte()?.marcas_compradas ?? []).slice(0, this.topN()),
    );
    readonly topMarcasLabels = computed(() => this.topMarcas().map(m => m.marca_nombre));
    readonly topMarcasData   = computed(() => this.topMarcas().map(m => m.total_historico));
    readonly topMarcasColors = computed(() => paletteColors(this.topMarcasData().length));
    readonly marcasFiltradas = computed(() => {
        const query = this.fMarcasSearch().trim().toLocaleLowerCase('es');
        const marcas = this.svc.reporte()?.marcas_compradas ?? [];
        return query
            ? marcas.filter(marca => marca.marca_nombre.toLocaleLowerCase('es').includes(query))
            : marcas;
    });

    // ── Marca seleccionada (drill-down de items) ────────────────────
    marcaSeleccionada = signal<MarcaVenta | null>(null);
    fProductosMarcaSearch = signal('');
    fMesesAtras = signal<3 | 6 | 12 | null>(null);
    itemsTopN = signal<5 | 10>(5);
    productosMarcaPage = signal(1);
    readonly productosMarcaTotalPages = computed(
        () => Math.max(1, Math.ceil(this.svc.productosMarcaTotal() / PRODUCTOS_PAGE_SIZE)),
    );

    readonly topItemsLabels = computed(() => this.svc.topItemsMarca().map(p => p.item_codigo));
    readonly topItemsData   = computed(() => this.svc.topItemsMarca().map(p => p.total_cantidad));
    readonly topItemsColors = computed(() => paletteColors(this.topItemsData().length));

    ngOnInit(): void {
        this.svc.loadVendedores();
    }

    ngOnDestroy(): void {
        this.svc.vendedores.set([]);
        this.svc.reset();
    }

    onVendedorChange(id: number | null): void {
        this.fVendedorId.set(id);
        this.fClienteId.set(null);
        this.marcaSeleccionada.set(null);
        this.fClientesSearch.set('');
        this.fMarcasSearch.set('');
        this.fProductosMarcaSearch.set('');
        this.svc.reset();
        if (id) {
            this.svc.loadClientes(id);
            this.svc.loadVentasHistoricasClientes(id);
        }
    }

    search(): void {
        const id = this.fClienteId();
        if (id) this.svc.loadReporte(id);
    }

    reset(): void {
        this.fVendedorId.set(null);
        this.fClienteId.set(null);
        this.marcaSeleccionada.set(null);
        this.fClientesSearch.set('');
        this.fMarcasSearch.set('');
        this.fProductosMarcaSearch.set('');
        this.svc.reset();
    }

    selectCliente(cliente: Cliente): void {
        this.fClienteId.set(cliente.id);
        this.marcaSeleccionada.set(null);
        this.fMarcasSearch.set('');
        this.fProductosMarcaSearch.set('');
        this.svc.loadReporte(cliente.id);
    }

    selectMarca(marca: MarcaVenta): void {
        const clienteId = this.svc.reporte()?.cliente.id;
        if (!clienteId) return;
        this.marcaSeleccionada.set(marca);
        this.fProductosMarcaSearch.set('');
        this.fMesesAtras.set(null);
        this.productosMarcaPage.set(1);
        this.svc.loadProductosMarca(clienteId, marca.marca_id, { page: 1, page_size: PRODUCTOS_PAGE_SIZE });
        this.svc.loadTopItemsMarca(clienteId, marca.marca_id, this.itemsTopN());
    }

    setMesesAtras(meses: 3 | 6 | 12 | null): void {
        this.fMesesAtras.set(meses);
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (!clienteId || !marcaId) return;
        this.productosMarcaPage.set(1);
        this.svc.loadProductosMarca(clienteId, marcaId, {
            page: 1,
            page_size: PRODUCTOS_PAGE_SIZE,
            search: this.fProductosMarcaSearch() || undefined,
            meses_atras: meses ?? undefined,
        });
    }

    setItemsTopN(n: 5 | 10): void {
        this.itemsTopN.set(n);
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (clienteId && marcaId) this.svc.loadTopItemsMarca(clienteId, marcaId, n);
    }

    onProductosMarcaLazyLoad(event: TableLazyLoadEvent): void {
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (!clienteId || !marcaId) return;

        const rows = event.rows ?? PRODUCTOS_PAGE_SIZE;
        const page = Math.floor((event.first ?? 0) / rows) + 1;
        this.productosMarcaPage.set(page);

        let ordering: string | undefined;
        if (event.sortField && typeof event.sortField === 'string') {
            ordering = event.sortOrder === -1 ? `-${event.sortField}` : event.sortField;
        }

        this.svc.loadProductosMarca(clienteId, marcaId, {
            page,
            page_size: rows,
            search: this.fProductosMarcaSearch() || undefined,
            ordering,
            meses_atras: this.fMesesAtras() ?? undefined,
        });
    }

    searchProductosMarca(value: string): void {
        this.fProductosMarcaSearch.set(value);
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (clienteId && marcaId) {
            this.productosMarcaPage.set(1);
            this.svc.loadProductosMarca(clienteId, marcaId, {
                page: 1, page_size: PRODUCTOS_PAGE_SIZE, search: value || undefined,
                meses_atras: this.fMesesAtras() ?? undefined,
            });
        }
    }

    changeProductosMarcaPage(page: number): void {
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (!clienteId || !marcaId || page < 1 || page > this.productosMarcaTotalPages()) return;

        this.productosMarcaPage.set(page);
        this.svc.loadProductosMarca(clienteId, marcaId, {
            page,
            page_size: PRODUCTOS_PAGE_SIZE,
            search: this.fProductosMarcaSearch() || undefined,
            meses_atras: this.fMesesAtras() ?? undefined,
        });
    }

    imprimir(): void {
        window.print();
    }
}
