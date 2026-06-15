import { Injectable, inject, signal } from '@angular/core';
import { RoleRepository } from '../../repositories/role.repository';

@Injectable({ providedIn: 'root' })
export class RolesService {
    private readonly repo = inject(RoleRepository);

    readonly roles = signal<any[]>([]);
    readonly permissions = signal<any[]>([]);
    readonly allRoles = signal<any[]>([]);
    readonly allPermissions = signal<any[]>([]);
    readonly isLoading = signal(false);
    readonly isLoadingPermissions = signal(false);
    readonly error = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);
    readonly totalCount = signal(0);
    readonly permissionsTotal = signal(0);

    private clearMessages(): void {
        this.error.set(null);
        this.successMessage.set(null);
    }

    loadRoles(page = 1, search = ''): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.list(page, search).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.roles.set(res.results ?? res);
                this.totalCount.set(res.count ?? 0);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al cargar los roles');
            },
        });
    }

    loadAllRoles(): void {
        this.repo.listAll().subscribe({
            next: (res) => { this.allRoles.set(res.results ?? res); },
            error: () => {},
        });
    }

    createRole(body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.create(body).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Rol creado exitosamente');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al crear el rol');
            },
        });
    }

    updateRole(id: number, body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.update(id, body).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Rol actualizado exitosamente');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al actualizar el rol');
            },
        });
    }

    deleteRole(id: number, onSuccess?: () => void): void {
        this.clearMessages();
        this.isLoading.set(true);
        this.repo.delete(id).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Rol eliminado');
                onSuccess?.();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.error.set(err?.error?.error ?? 'Error al eliminar el rol');
            },
        });
    }

    loadPermissions(page = 1, search = ''): void {
        this.isLoadingPermissions.set(true);
        this.repo.listPermissions(page, search).subscribe({
            next: (res) => {
                this.isLoadingPermissions.set(false);
                this.permissions.set(res.results ?? res);
                this.permissionsTotal.set(res.count ?? 0);
            },
            error: () => { this.isLoadingPermissions.set(false); },
        });
    }

    loadAllPermissions(): void {
        this.repo.listAllPermissions().subscribe({
            next: (res) => { this.allPermissions.set(res.results ?? res); },
            error: () => {},
        });
    }

    createPermission(body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.repo.createPermission(body).subscribe({
            next: () => {
                this.successMessage.set('Permiso creado exitosamente');
                onSuccess?.();
            },
            error: (err) => { this.error.set(err?.error?.error ?? 'Error al crear el permiso'); },
        });
    }

    updatePermission(id: number, body: any, onSuccess?: () => void): void {
        this.clearMessages();
        this.repo.updatePermission(id, body).subscribe({
            next: () => {
                this.successMessage.set('Permiso actualizado exitosamente');
                onSuccess?.();
            },
            error: (err) => { this.error.set(err?.error?.error ?? 'Error al actualizar el permiso'); },
        });
    }

    deletePermission(id: number, onSuccess?: () => void): void {
        this.clearMessages();
        this.repo.deletePermission(id).subscribe({
            next: () => {
                this.successMessage.set('Permiso eliminado');
                onSuccess?.();
            },
            error: (err) => { this.error.set(err?.error?.error ?? 'Error al eliminar el permiso'); },
        });
    }
}
