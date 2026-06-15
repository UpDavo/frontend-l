import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [ReactiveFormsModule, RouterLink, ProgressSpinner],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService
      .requestPasswordReset({ email: this.form.value.email! })
      .subscribe({
        next: (res) => {
          this.successMessage.set(
            res.message ??
              'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
          );
          this.form.reset();
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo enviar el correo. Verifica la dirección e intenta de nuevo.'
          );
          this.isLoading.set(false);
        },
      });
  }
}
