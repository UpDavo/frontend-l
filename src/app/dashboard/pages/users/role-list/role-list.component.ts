import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RolesService } from '../../../services/roles/roles.service';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

const PAGE_SIZE = 10;

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent],
    templateUrl: './role-list.component.html',
})
export class RoleListComponent implements OnInit {
    readonly svc = inject(RolesService);
    readonly searchControl = new FormControl('');

    readonly page = signal(1);
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.svc.totalCount() / PAGE_SIZE)));

    showForm = false;
    editingId: number | null = null;
    formName = '';
    formDescription = '';
    formIsAdmin = false;
    formPermissions: string[] = [];

    showDelete = false;
    deletingRole: any = null;

    ngOnInit(): void {
        this.svc.loadRoles(this.page());
        this.svc.loadAllPermissions();
        this.searchControl.valueChanges.pipe(
            debounceTime(400), distinctUntilChanged(),
        ).subscribe(val => {
            this.page.set(1);
            this.svc.loadRoles(1, val ?? '');
        });
    }

    openCreate(): void {
        this.editingId = null;
        this.formName = '';
        this.formDescription = '';
        this.formIsAdmin = false;
        this.formPermissions = [];
        this.showForm = true;
    }

    openEdit(role: any): void {
        this.editingId = role.id;
        this.formName = role.name ?? '';
        this.formDescription = role.description ?? '';
        this.formIsAdmin = !!role.is_admin;
        this.formPermissions = Array.isArray(role.permissions)
            ? role.permissions.map((p: any) => (p.id ?? p).toString())
            : [];
        this.showForm = true;
    }

    togglePermission(permId: string): void {
        if (this.formPermissions.includes(permId)) {
            this.formPermissions = this.formPermissions.filter(id => id !== permId);
        } else {
            this.formPermissions = [...this.formPermissions, permId];
        }
    }

    isPermSelected(permId: string): boolean {
        return this.formPermissions.includes(permId);
    }

    submitForm(): void {
        const body = {
            name: this.formName,
            description: this.formDescription,
            is_admin: this.formIsAdmin,
            permissions: this.formPermissions.map(id => Number(id)),
        };
        if (this.editingId) {
            this.svc.updateRole(this.editingId, body, () => {
                this.showForm = false;
                this.svc.loadRoles(this.page());
            });
        } else {
            this.svc.createRole(body, () => {
                this.showForm = false;
                this.svc.loadRoles(this.page());
            });
        }
    }

    openDelete(role: any): void {
        this.deletingRole = role;
        this.showDelete = true;
    }

    confirmDelete(): void {
        if (!this.deletingRole) return;
        this.svc.deleteRole(this.deletingRole.id, () => {
            this.showDelete = false;
            this.deletingRole = null;
            this.svc.loadRoles(this.page());
        });
    }

    onPageChange(p: number): void {
        this.page.set(p);
        this.svc.loadRoles(p, this.searchControl.value ?? '');
    }

    permissionNames(permissions: any[]): string {
        if (!Array.isArray(permissions) || permissions.length === 0) return '—';
        return permissions.map(p => p.name ?? p).join(', ');
    }

    get formConfirmDisabled(): boolean {
        return !this.formName.trim();
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
