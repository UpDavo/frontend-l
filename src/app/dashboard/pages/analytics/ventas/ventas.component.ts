import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../../services/analytics/ventas.service';
import { ServerTableComponent } from '../../../../shared/components/server-table/server-table.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';

const PAGE_SIZE = 10;

function currentMonthRange(): { desde: string; hasta: string } {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth();
    const desde = new Date(year, month, 1);
    const hasta = new Date(year, month + 1, 0);
    const fmt   = (d: Date) => d.toISOString().slice(0, 10);
    return { desde: fmt(desde), hasta: fmt(hasta) };
}

@Component({
    selector: 'app-ventas',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ServerTableComponent, FilterBarComponent,
        AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent,
        MultiSelectComponent,
    ],
    templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
    readonly svc = inject(VentasService);

    // ── Filtros ───────────────────────────────────────────────────
    fSearch     = '';
    fCiudades: string[] = [];
    fItem       = '';
    fFechaDesde = currentMonthRange().desde;
    fFechaHasta = currentMonthRange().hasta;

    // ── Paginación ────────────────────────────────────────────────
    page        = signal(1);
    pageSize    = signal(PAGE_SIZE);
    totalPages  = computed(() => Math.max(1, Math.ceil(this.svc.total() / this.pageSize())));

    // ── Form create/edit ──────────────────────────────────────────
    showForm    = false;
    editingId: number | null = null;
    form = {
        fecha_venta: '', item: '', descripcion: '', desc_repuesto: '',
        desc_marca: '', cliente: '', ciudad: '', provincia: '',
        cantidad: '', precio_unit: '', neto: '', asesor: '',
    };

    // ── Confirm delete ────────────────────────────────────────────
    showDelete  = false;
    deletingRow: any = null;

    ngOnInit(): void { this.svc.loadCiudades(); this.loadData(); }

    private buildFilter() {
        return {
            page:        this.page(),
            page_size:   this.pageSize(),
            search:      this.fSearch              || undefined,
            ciudades:    this.fCiudades.length ? this.fCiudades : undefined,
            item:        this.fItem                || undefined,
            fecha_desde: this.fFechaDesde          || undefined,
            fecha_hasta: this.fFechaHasta          || undefined,
        };
    }

    private buildMetricasFilter() {
        return {
            ciudades:    this.fCiudades.length ? this.fCiudades : undefined,
            item:        this.fItem       || undefined,
            fecha_desde: this.fFechaDesde || undefined,
            fecha_hasta: this.fFechaHasta || undefined,
        };
    }

    loadData(): void {
        this.svc.load(this.buildFilter());
        this.svc.loadMetricas(this.buildMetricasFilter());
    }

    search(): void { this.page.set(1); this.loadData(); }

    reset(): void {
        const { desde, hasta } = currentMonthRange();
        this.fSearch = ''; this.fCiudades = []; this.fItem = '';
        this.fFechaDesde = desde; this.fFechaHasta = hasta;
        this.page.set(1); this.loadData();
    }

    onPageChange(p: number): void { this.page.set(p); this.loadData(); }
    onPageSizeChange(s: number): void { this.pageSize.set(s); this.page.set(1); this.loadData(); }

    // ── CRUD ──────────────────────────────────────────────────────
    openCreate(): void {
        this.editingId = null;
        this.form = { fecha_venta: '', item: '', descripcion: '', desc_repuesto: '',
            desc_marca: '', cliente: '', ciudad: '', provincia: '',
            cantidad: '', precio_unit: '', neto: '', asesor: '' };
        this.showForm = true;
    }

    openEdit(row: any): void {
        this.editingId = row.id;
        this.form = {
            fecha_venta: row.fecha_venta ?? '', item: row.item ?? '',
            descripcion: row.descripcion ?? '', desc_repuesto: row.desc_repuesto ?? '',
            desc_marca: row.desc_marca ?? '', cliente: row.cliente ?? '',
            ciudad: row.ciudad ?? '', provincia: row.provincia ?? '',
            cantidad: row.cantidad ?? '', precio_unit: row.precio_unit ?? '',
            neto: row.neto ?? '', asesor: row.asesor ?? '',
        };
        this.showForm = true;
    }

    submitForm(): void {
        const body = { ...this.form,
            cantidad: this.form.cantidad ? +this.form.cantidad : null,
            precio_unit: this.form.precio_unit ? +this.form.precio_unit : null,
            neto: this.form.neto ? +this.form.neto : null,
        };
        const done = () => { this.showForm = false; this.loadData(); };
        if (this.editingId) this.svc.update(this.editingId, body, done);
        else                this.svc.create(body, done);
    }

    openDelete(row: any): void { this.deletingRow = row; this.showDelete = true; }

    confirmDelete(): void {
        if (!this.deletingRow) return;
        this.svc.delete(this.deletingRow.id, () => {
            this.showDelete = false; this.deletingRow = null; this.loadData();
        });
    }

    get formValid(): boolean { return !!this.form.item?.trim(); }
}
