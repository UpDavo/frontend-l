import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../services/analytics/stock.service';
import { ServerTableComponent } from '../../../../shared/components/server-table/server-table.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';

const PAGE_SIZE = 10;

@Component({
    selector: 'app-stock',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ServerTableComponent, FilterBarComponent,
        AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent,
        MultiSelectComponent,
    ],
    templateUrl: './stock.component.html',
})
export class StockComponent implements OnInit {
    readonly svc = inject(StockService);

    // ── Filtros ───────────────────────────────────────────────────
    fSearch:     string   = '';
    fMarcas:     string[] = [];
    fFabricas:   string[] = [];
    fEstados:    string[] = [];
    fCategorias: string[] = [];
    fOrdering:   string   = '';

    // ── Paginación ────────────────────────────────────────────────
    page         = signal(1);
    pageSize     = signal(PAGE_SIZE);
    totalPages   = computed(() => Math.max(1, Math.ceil(this.svc.total() / this.pageSize())));

    // ── Form ──────────────────────────────────────────────────────
    showForm     = false;
    editingId: number | null = null;
    form = {
        item: '', descripcion: '', fabrica: '', marca: '',
        nombre: '', linea: '', categoria: '', estado_stock: '',
        stock_act_bod: '', precio_pvp: '', precio_mostrador: '', precio_mayorista: '',
    };

    showDelete   = false;
    deletingRow: any = null;

    ngOnInit(): void { this.svc.loadOpciones(); this.loadData(); }

    private buildFilter() {
        return {
            page:       this.page(),
            page_size:  this.pageSize(),
            search:     this.fSearch              || undefined,
            marcas:     this.fMarcas.length     ? this.fMarcas     : undefined,
            fabricas:   this.fFabricas.length   ? this.fFabricas   : undefined,
            estados:    this.fEstados.length    ? this.fEstados    : undefined,
            categorias: this.fCategorias.length ? this.fCategorias : undefined,
            ordering:   this.fOrdering            || undefined,
        };
    }

    private buildMetricasFilter() {
        return {
            search:     this.fSearch              || undefined,
            marcas:     this.fMarcas.length     ? this.fMarcas     : undefined,
            fabricas:   this.fFabricas.length   ? this.fFabricas   : undefined,
            estados:    this.fEstados.length    ? this.fEstados    : undefined,
            categorias: this.fCategorias.length ? this.fCategorias : undefined,
        };
    }

    loadData(): void {
        this.svc.load(this.buildFilter());
        this.svc.loadMetricas(this.buildMetricasFilter());
    }

    search(): void { this.page.set(1); this.loadData(); }

    reset(): void {
        this.fSearch = ''; this.fMarcas = []; this.fFabricas = [];
        this.fEstados = []; this.fCategorias = []; this.fOrdering = '';
        this.page.set(1); this.loadData();
    }

    setOrdering(value: string): void {
        this.fOrdering = this.fOrdering === value ? `-${value}` : value;
        this.page.set(1); this.loadData();
    }

    onPageChange(p: number): void { this.page.set(p); this.loadData(); }
    onPageSizeChange(s: number): void { this.pageSize.set(s); this.page.set(1); this.loadData(); }

    // ── CRUD ──────────────────────────────────────────────────────
    openCreate(): void {
        this.editingId = null;
        this.form = { item: '', descripcion: '', fabrica: '', marca: '',
            nombre: '', linea: '', categoria: '', estado_stock: '',
            stock_act_bod: '', precio_pvp: '', precio_mostrador: '', precio_mayorista: '' };
        this.showForm = true;
    }

    openEdit(row: any): void {
        this.editingId = row.id;
        this.form = {
            item: row.item ?? '', descripcion: row.descripcion ?? '',
            fabrica: row.fabrica ?? '', marca: row.marca ?? '',
            nombre: row.nombre ?? '', linea: row.linea ?? '',
            categoria: row.categoria ?? '', estado_stock: row.estado_stock ?? '',
            stock_act_bod: row.stock_act_bod ?? '', precio_pvp: row.precio_pvp ?? '',
            precio_mostrador: row.precio_mostrador ?? '', precio_mayorista: row.precio_mayorista ?? '',
        };
        this.showForm = true;
    }

    submitForm(): void {
        const body = { ...this.form,
            stock_act_bod:    this.form.stock_act_bod    ? +this.form.stock_act_bod    : null,
            precio_pvp:       this.form.precio_pvp       ? +this.form.precio_pvp       : null,
            precio_mostrador: this.form.precio_mostrador ? +this.form.precio_mostrador : null,
            precio_mayorista: this.form.precio_mayorista ? +this.form.precio_mayorista : null,
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

    stockSortIcon(): string {
        if (this.fOrdering === 'stock_act_bod')  return 'pi pi-arrow-up';
        if (this.fOrdering === '-stock_act_bod') return 'pi pi-arrow-down';
        return 'pi pi-sort';
    }
}
