import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UsersService } from '../../../services/users/users.service';
import { RolesService } from '../../../services/roles/roles.service';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FormDialogComponent } from '../../../../shared/components/form-dialog/form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

const PAGE_SIZE = 10;

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, AlertBannerComponent, FormDialogComponent, ConfirmDialogComponent],
    templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
    readonly svc = inject(UsersService);
    readonly rolesSvc = inject(RolesService);
    readonly searchControl = new FormControl('');

    readonly page = signal(1);
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.svc.totalCount() / PAGE_SIZE)));

    showForm = false;
    editingId: number | null = null;
    formEmail = '';
    formPassword = '';
    formFirstName = '';
    formLastName = '';
    formPhone = '';
    formRole = '';

    showDelete = false;
    deletingUser: any = null;

    ngOnInit(): void {
        this.svc.loadUsers(this.page());
        this.rolesSvc.loadAllRoles();
        this.searchControl.valueChanges.pipe(
            debounceTime(400), distinctUntilChanged(),
        ).subscribe(val => {
            this.page.set(1);
            this.svc.loadUsers(1, val ?? undefined);
        });
    }

    openCreate(): void {
        this.editingId = null;
        this.formEmail = '';
        this.formPassword = '';
        this.formFirstName = '';
        this.formLastName = '';
        this.formPhone = '';
        this.formRole = '';
        this.showForm = true;
    }

    openEdit(user: any): void {
        this.editingId = user.id;
        this.formEmail = user.email ?? '';
        this.formPassword = '';
        this.formFirstName = user.first_name ?? '';
        this.formLastName = user.last_name ?? '';
        this.formPhone = user.phone_number ?? '';
        this.formRole = user.role ? user.role.toString() : '';
        this.showForm = true;
    }

    submitForm(): void {
        const body = {
            email: this.formEmail,
            first_name: this.formFirstName,
            last_name: this.formLastName,
            phone_number: this.formPhone,
            role: this.formRole ? parseInt(this.formRole) : 0,
        };
        if (this.editingId) {
            this.svc.updateUser(this.editingId, body, () => {
                this.showForm = false;
                this.svc.loadUsers(this.page());
            });
        } else {
            this.svc.createUser({ ...body, password: this.formPassword }, () => {
                this.showForm = false;
                this.svc.loadUsers(this.page());
            });
        }
    }

    openDelete(user: any): void {
        this.deletingUser = user;
        this.showDelete = true;
    }

    confirmDelete(): void {
        if (!this.deletingUser) return;
        this.svc.deleteUser(this.deletingUser.id, () => {
            this.showDelete = false;
            this.deletingUser = null;
            this.svc.loadUsers(this.page());
        });
    }

    onPageChange(p: number): void {
        this.page.set(p);
        this.svc.loadUsers(p, this.searchControl.value ?? undefined);
    }

    get formConfirmDisabled(): boolean {
        if (!this.editingId && !this.formPassword) return true;
        return !this.formEmail.trim() || !this.formFirstName.trim();
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
