import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
const PRODUCTOS_PAGE_SIZE = 20;

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
export class SellersReportComponent implements OnInit {
    readonly svc = inject(SellersService);

    fVendedorId = signal<number | null>(null);
    fClienteId  = signal<number | null>(null);

    readonly vendedorOptions = computed<SelectOption[]>(
        () => this.svc.vendedores().map(v => ({ id: v.id, label: v.nombre })),
    );

    readonly anios = ANIOS;

    readonly resumenLabels = computed(
        () => this.svc.reporte()?.resumen_anual.map(r => String(r.anio)) ?? [],
    );
    readonly resumenData = computed(
        () => this.svc.reporte()?.resumen_anual.map(r => r.total_usd) ?? [],
    );

    readonly clienteMetric = computed<MetricCardData | null>(() => {
        const r = this.svc.reporte();
        if (!r) return null;
        return {
            title: 'Ventas históricas totales',
            value: `$${r.marcas_compradas.reduce((s, m) => s + m.total_historico, 0).toLocaleString('es-EC', { maximumFractionDigits: 0 })}`,
            gradient: 'primary-indigo',
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

    // ── Marca seleccionada (drill-down de items) ────────────────────
    marcaSeleccionada = signal<MarcaVenta | null>(null);
    fProductosMarcaSearch = signal('');

    readonly marcaSeleccionadaLabels = computed(() => this.anios.map(String));
    readonly marcaSeleccionadaData   = computed(() => {
        const m = this.marcaSeleccionada();
        return m ? this.anios.map(a => m.anios[a] ?? 0) : [];
    });

    ngOnInit(): void {
        this.svc.loadVendedores();
    }

    onVendedorChange(id: number | null): void {
        this.fVendedorId.set(id);
        this.fClienteId.set(null);
        this.marcaSeleccionada.set(null);
        this.fProductosMarcaSearch.set('');
        this.svc.reset();
        if (id) this.svc.loadClientes(id);
    }

    search(): void {
        const id = this.fClienteId();
        if (id) this.svc.loadReporte(id);
    }

    reset(): void {
        this.fVendedorId.set(null);
        this.fClienteId.set(null);
        this.marcaSeleccionada.set(null);
        this.fProductosMarcaSearch.set('');
        this.svc.reset();
    }

    selectCliente(cliente: Cliente): void {
        this.fClienteId.set(cliente.id);
        this.marcaSeleccionada.set(null);
        this.fProductosMarcaSearch.set('');
        this.svc.loadReporte(cliente.id);
    }

    selectMarca(marca: MarcaVenta): void {
        const clienteId = this.svc.reporte()?.cliente.id;
        if (!clienteId) return;
        this.marcaSeleccionada.set(marca);
        this.fProductosMarcaSearch.set('');
        this.svc.loadProductosMarca(clienteId, marca.marca_id, { page: 1, page_size: PRODUCTOS_PAGE_SIZE });
    }

    onProductosMarcaLazyLoad(event: TableLazyLoadEvent): void {
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (!clienteId || !marcaId) return;

        const rows = event.rows ?? PRODUCTOS_PAGE_SIZE;
        const page = Math.floor((event.first ?? 0) / rows) + 1;

        let ordering: string | undefined;
        if (event.sortField && typeof event.sortField === 'string') {
            ordering = event.sortOrder === -1 ? `-${event.sortField}` : event.sortField;
        }

        this.svc.loadProductosMarca(clienteId, marcaId, {
            page,
            page_size: rows,
            search: this.fProductosMarcaSearch() || undefined,
            ordering,
        });
    }

    searchProductosMarca(value: string): void {
        this.fProductosMarcaSearch.set(value);
        const clienteId = this.svc.reporte()?.cliente.id;
        const marcaId = this.marcaSeleccionada()?.marca_id;
        if (clienteId && marcaId) {
            this.svc.loadProductosMarca(clienteId, marcaId, { page: 1, page_size: PRODUCTOS_PAGE_SIZE, search: value || undefined });
        }
    }

    imprimir(): void {
        window.print();
    }
}
