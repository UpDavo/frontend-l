import {
    Component,
    Input,
    Output,
    EventEmitter,
    ContentChild,
    TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ServerTableComponent — tabla genérica con paginación server-side.
 *
 * Uso:
 * ```html
 * <app-server-table
 *     [data]="items()"
 *     [isLoading]="isLoading()"
 *     [totalCount]="totalCount()"
 *     [currentPage]="currentPage()"
 *     [totalPages]="totalPages()"
 *     [pageSize]="pageSize"
 *     (pageChange)="goToPage($event)"
 *     (pageSizeChange)="changePageSize($event)">
 *
 *     <ng-template #headerTemplate>
 *         <tr>...</tr>
 *     </ng-template>
 *
 *     <ng-template #rowTemplate let-row>
 *         <tr>...</tr>
 *     </ng-template>
 * </app-server-table>
 * ```
 */
@Component({
    selector: 'app-server-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './server-table.component.html',
})
export class ServerTableComponent {
    // ── Datos ────────────────────────────────────────────────────
    @Input() data: any[] = [];
    @Input() isLoading = false;

    // ── Paginación ───────────────────────────────────────────────
    @Input() totalCount = 0;
    @Input() currentPage = 1;
    @Input() totalPages = 1;
    @Input() pageSize = 20;

    // ── Estilo ───────────────────────────────────────────────────
    @Input() minWidth = '750px';

    // ── Estado vacío ─────────────────────────────────────────────
    @Input() emptyIcon = 'pi pi-inbox';
    @Input() emptyMessage = 'No se encontraron registros';
    @Input() emptySubMessage = 'Intenta ajustar los filtros de búsqueda';

    // ── Eventos ──────────────────────────────────────────────────
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    // ── Templates ────────────────────────────────────────────────
    @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;
    @ContentChild('rowTemplate') rowTemplate?: TemplateRef<{ $implicit: any }>;
    @ContentChild('emptyTemplate') emptyTemplate?: TemplateRef<any>;

    // ── Paginación helpers ───────────────────────────────────────
    get pageRange(): number[] {
        const delta = 2;
        const left = Math.max(1, this.currentPage - delta);
        const right = Math.min(this.totalPages, this.currentPage + delta);
        const range: number[] = [];
        for (let i = left; i <= right; i++) range.push(i);
        return range;
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.pageChange.emit(page);
    }

    onPageSizeChange(event: Event): void {
        const value = +(event.target as HTMLSelectElement).value;
        this.pageSizeChange.emit(value);
    }
}
