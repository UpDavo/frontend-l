import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, ProgressSpinner],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    loginForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(1)]],
    });

    /** Signals del store */
    isLoading = this.authService.isLoading;
    errorMessage = this.authService.error;

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { email, password } = this.loginForm.getRawValue();
        this.authService.login({ email, password });
    }
}
