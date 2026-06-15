import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth/auth.service';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

/** Validador: new_password !== old_password */
function samePasswordValidator(ctrl: AbstractControl): ValidationErrors | null {
    const parent = ctrl.parent;
    if (!parent) return null;
    const oldVal = parent.get('old_password')?.value;
    return ctrl.value && ctrl.value === oldVal ? { sameAsOld: true } : null;
}

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [ReactiveFormsModule, AlertBannerComponent],
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly showOld = { value: false };
    readonly showNew = { value: false };

    isLoading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    fieldErrors: Record<string, string> | null = null;

    readonly form = this.fb.group({
        old_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(8), samePasswordValidator]],
    });

    // ── Helpers de visualización ──────────────────────────────────

    isInvalid(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl?.invalid && ctrl.touched);
    }

    fieldError(field: string): string | null {
        if (this.isInvalid(field)) return this.validationMessage(field);
        return this.fieldErrors?.[field] ?? null;
    }

    hasServerError(field: string): boolean {
        return !!this.fieldErrors?.[field];
    }

    private validationMessage(field: string): string {
        const ctrl = this.form.get(field);
        if (!ctrl?.errors) return '';
        if (ctrl.errors['required']) return 'Este campo es requerido';
        if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
        if (ctrl.errors['sameAsOld']) return 'La nueva contraseña debe ser diferente a la actual';
        return 'Valor inválido';
    }

    // ── Submit ────────────────────────────────────────────────────

    onSubmit(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        this.isLoading = true;
        this.errorMessage = null;
        this.successMessage = null;
        this.fieldErrors = null;

        const { old_password, new_password } = this.form.getRawValue();

        this.authService.changePassword({
            old_password: old_password!,
            new_password: new_password!,
        }).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.successMessage = res.message;
                // Cerrar sesión tras cambio exitoso (el servidor lo indica)
                setTimeout(() => this.authService.logout().subscribe(), 1000);
            },
            error: (err) => {
                this.isLoading = false;
                const body = err?.error;
                if (body?.old_password || body?.new_password) {
                    this.fieldErrors = {
                        ...(body.old_password ? { old_password: body.old_password[0] } : {}),
                        ...(body.new_password ? { new_password: body.new_password[0] } : {}),
                    };
                    this.errorMessage = 'Corrige los errores del formulario.';
                } else {
                    this.errorMessage = body?.message ?? body?.error ?? 'Error al cambiar la contraseña';
                }
            },
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard']);
    }
}
