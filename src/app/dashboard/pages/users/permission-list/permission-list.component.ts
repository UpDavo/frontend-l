import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RolesService } from '../../../services/roles/roles.service';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PERM } from '../../../dashboard-nav.config';

const PAGE_SIZE = 10;

const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'DELETE'];
const METHOD_MAP: Record<string, number> = { GET: 1, POST: 2, PUT: 3, DELETE: 4 };

const ROUTE_OPTIONS = Object.values(PERM);

@Component({
    selector: 'app-permission-list',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent],
    templateUrl: './permission-list.component.html',
})
export class PermissionListComponent implements OnInit {
    readonly svc = inject(RolesService);
    readonly searchControl = new FormControl('');

    readonly page = signal(1);
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.svc.permissionsTotal() / PAGE_SIZE)));

    readonly METHOD_OPTIONS = METHOD_OPTIONS;
    readonly ROUTE_OPTIONS = ROUTE_OPTIONS;

    showForm = false;
    editingId: number | null = null;
    formName = '';
    formPath = '';
    formMethods: string[] = [];
    formDescription = '';

    showDelete = false;
    deletingPerm: any = null;

    ngOnInit(): void {
        this.svc.loadPermissions(this.page());
        this.svc.loadAllPermissions();
        this.searchControl.valueChanges.pipe(
            debounceTime(400), distinctUntilChanged(),
        ).subscribe(val => {
            this.page.set(1);
            this.svc.loadPermissions(1, val ?? '');
        });
    }

    get availableRoutes(): string[] {
        const usedPaths = new Set(
            this.svc.allPermissions()
                .filter((p: any) => p.id !== this.editingId)
                .map((p: any) => p.path)
        );
        return ROUTE_OPTIONS.filter(route => !usedPaths.has(route));
    }

    openCreate(): void {
        this.editingId = null;
        this.formName = '';
        this.formPath = '';
        this.formMethods = [];
        this.formDescription = '';
        this.showForm = true;
    }

    openEdit(perm: any): void {
        this.editingId = perm.id;
        this.formName = perm.name ?? '';
        this.formPath = perm.path ?? '';
        this.formMethods = Array.isArray(perm.methods)
            ? perm.methods.map((m: any) => typeof m === 'string' ? m : m.name ?? '')
            : [];
        this.formDescription = perm.description ?? '';
        this.showForm = true;
    }

    toggleMethod(method: string): void {
        if (this.formMethods.includes(method)) {
            this.formMethods = this.formMethods.filter(m => m !== method);
        } else {
            this.formMethods = [...this.formMethods, method];
        }
    }

    isMethodSelected(method: string): boolean {
        return this.formMethods.includes(method);
    }

    submitForm(): void {
        const body = {
            name: this.formName,
            path: this.formPath,
            methods: this.formMethods.map(m => METHOD_MAP[m] ?? m),
            description: this.formDescription,
        };
        if (this.editingId) {
            this.svc.updatePermission(this.editingId, body, () => {
                this.showForm = false;
                this.svc.loadPermissions(this.page());
                this.svc.loadAllPermissions();
            });
        } else {
            this.svc.createPermission(body, () => {
                this.showForm = false;
                this.svc.loadPermissions(this.page());
                this.svc.loadAllPermissions();
            });
        }
    }

    openDelete(perm: any): void {
        this.deletingPerm = perm;
        this.showDelete = true;
    }

    confirmDelete(): void {
        if (!this.deletingPerm) return;
        this.svc.deletePermission(this.deletingPerm.id, () => {
            this.showDelete = false;
            this.deletingPerm = null;
            this.svc.loadPermissions(this.page());
            this.svc.loadAllPermissions();
        });
    }

    onPageChange(p: number): void {
        this.page.set(p);
        this.svc.loadPermissions(p, this.searchControl.value ?? '');
    }

    methodNames(methods: any[]): string {
        if (!Array.isArray(methods) || methods.length === 0) return '—';
        return methods.map(m => typeof m === 'string' ? m : m.name ?? '').join(', ');
    }

    get formConfirmDisabled(): boolean {
        return !this.formName.trim() || !this.formPath.trim();
    }

    get pages(): number[] {
        const total = this.totalPages();
        const current = this.page();
        const maxVisible = 5;
        if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);
        let start = Math.max(1, current - 2);
        const end = Math.min(total, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
}
