import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImportacionesService } from '../../../services/analytics/importaciones.service';
import { ServerTableComponent } from '../../../../shared/components/server-table/server-table.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';

const PAGE_SIZE = 10;

function currentMonthRange(): { desde: string; hasta: string } {
    const now  = new Date();
    const y    = now.getFullYear();
    const m    = now.getMonth();
    const fmt  = (d: Date) => d.toISOString().slice(0, 10);
    return { desde: fmt(new Date(y, m, 1)), hasta: fmt(new Date(y, m + 1, 0)) };
}

@Component({
    selector: 'app-importaciones',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ServerTableComponent, FilterBarComponent,
        AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent,
        MultiSelectComponent,
    ],
    templateUrl: './importaciones.component.html',
})
export class ImportacionesComponent implements OnInit {
    readonly svc = inject(ImportacionesService);

    // ── Filtros ───────────────────────────────────────────────────
    fSearch:        string   = '';
    fImportadores:  string[] = [];
    fPaisesOrigen:  string[] = [];
    fMarcas:        string[] = [];
    fFechaDesde:    string   = currentMonthRange().desde;
    fFechaHasta:    string   = currentMonthRange().hasta;

    // ── Paginación ────────────────────────────────────────────────
    page       = signal(1);
    pageSize   = signal(PAGE_SIZE);
    totalPages = computed(() => Math.max(1, Math.ceil(this.svc.total() / this.pageSize())));

    // ── Form ──────────────────────────────────────────────────────
    showForm   = false;
    editingId: number | null = null;
    form = {
        fecha: '', importador: '', exportador: '', descripcion_comercial: '',
        marca: '', pais_origen: '', pais_embarque: '', tipo_importacion: '',
        qty_2: '', usd_cif_tot: '', usd_fob_tot: '', kg_bruto: '',
    };

    showDelete   = false;
    deletingRow: any = null;

    ngOnInit(): void { this.svc.loadOpciones(); this.loadData(); }

    private buildFilter() {
        return {
            page:          this.page(),
            page_size:     this.pageSize(),
            search:        this.fSearch                  || undefined,
            importadores:  this.fImportadores.length  ? this.fImportadores  : undefined,
            paises_origen: this.fPaisesOrigen.length  ? this.fPaisesOrigen  : undefined,
            marcas:        this.fMarcas.length         ? this.fMarcas        : undefined,
            fecha_desde:   this.fFechaDesde             || undefined,
            fecha_hasta:   this.fFechaHasta             || undefined,
        };
    }

    private buildMetricasFilter() {
        return {
            importadores:  this.fImportadores.length  ? this.fImportadores  : undefined,
            paises_origen: this.fPaisesOrigen.length  ? this.fPaisesOrigen  : undefined,
            marcas:        this.fMarcas.length         ? this.fMarcas        : undefined,
            fecha_desde:   this.fFechaDesde             || undefined,
            fecha_hasta:   this.fFechaHasta             || undefined,
        };
    }

    loadData(): void {
        this.svc.load(this.buildFilter());
        this.svc.loadMetricas(this.buildMetricasFilter());
    }

    search(): void { this.page.set(1); this.loadData(); }

    reset(): void {
        const { desde, hasta } = currentMonthRange();
        this.fSearch = ''; this.fImportadores = []; this.fPaisesOrigen = [];
        this.fMarcas = []; this.fFechaDesde = desde; this.fFechaHasta = hasta;
        this.page.set(1); this.loadData();
    }

    onPageChange(p: number): void { this.page.set(p); this.loadData(); }
    onPageSizeChange(s: number): void { this.pageSize.set(s); this.page.set(1); this.loadData(); }

    // ── CRUD ──────────────────────────────────────────────────────
    openCreate(): void {
        this.editingId = null;
        this.form = { fecha: '', importador: '', exportador: '', descripcion_comercial: '',
            marca: '', pais_origen: '', pais_embarque: '', tipo_importacion: '',
            qty_2: '', usd_cif_tot: '', usd_fob_tot: '', kg_bruto: '' };
        this.showForm = true;
    }

    openEdit(row: any): void {
        this.editingId = row.id;
        this.form = {
            fecha: row.fecha ?? '', importador: row.importador ?? '',
            exportador: row.exportador ?? '', descripcion_comercial: row.descripcion_comercial ?? '',
            marca: row.marca ?? '', pais_origen: row.pais_origen ?? '',
            pais_embarque: row.pais_embarque ?? '', tipo_importacion: row.tipo_importacion ?? '',
            qty_2: row.qty_2 ?? '', usd_cif_tot: row.usd_cif_tot ?? '',
            usd_fob_tot: row.usd_fob_tot ?? '', kg_bruto: row.kg_bruto ?? '',
        };
        this.showForm = true;
    }

    submitForm(): void {
        const body = { ...this.form,
            qty_2:       this.form.qty_2       ? +this.form.qty_2       : null,
            usd_cif_tot: this.form.usd_cif_tot ? +this.form.usd_cif_tot : null,
            usd_fob_tot: this.form.usd_fob_tot ? +this.form.usd_fob_tot : null,
            kg_bruto:    this.form.kg_bruto    ? +this.form.kg_bruto    : null,
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

    get formValid(): boolean { return !!this.form.importador?.trim(); }
}
