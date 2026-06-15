import { Injectable, inject, signal } from '@angular/core';
import { UserManagementRepository } from '../../repositories/user-management.repository';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private readonly repo = inject(UserManagementRepository);

    readonly users = signal<any[]>([]);
    readonly selectedUser = signal<any | null>(null);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);
    readonly totalCount = signal(0);

    private clearMessages(): void {
        this.error.set(null);
        this.successMessage.set(null);
    }

    loadUsers(page = 1, email?: string): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.list(page, email).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.users.set(res.results ?? res);
                this.totalCount.set(res.count ?? 0);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al cargar los usuarios');
            },
        });
    }

    loadUser(id: number): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.getById(id).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.selectedUser.set(res);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al cargar el usuario');
            },
        });
    }

    createUser(body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        const payload = {
            email: body.email,
            password: body.password,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number,
            role: body.role ?? 0,
            is_verified: true,
        };
        this.repo.create(payload).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Usuario creado exitosamente');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al crear el usuario');
            },
        });
    }

    updateUser(id: number, body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        const payload = {
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name ?? '',
            phone_number: body.phone_number ?? '',
            role: body.role ?? 0,
        };
        this.repo.update(id, payload).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Usuario actualizado exitosamente');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al actualizar el usuario');
            },
        });
    }

    deleteUser(id: number, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.delete(id).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Usuario eliminado');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al eliminar el usuario');
            },
        });
    }
}
