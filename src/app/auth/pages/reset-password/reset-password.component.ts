import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth/auth.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  if (!newPassword || !confirmPassword) return null;
  return newPassword.value !== confirmPassword.value
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [ReactiveFormsModule, RouterLink, ProgressSpinner],
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private uid = '';
  private token = '';

  isTokenValid = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  ngOnInit(): void {
    this.uid = this.route.snapshot.queryParamMap.get('uid') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.uid || !this.token) {
      this.isTokenValid.set(false);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .confirmPasswordReset({
        uid: this.uid,
        token: this.token,
        new_password: this.form.value.newPassword!,
      })
      .subscribe({
        next: (res) => {
          this.successMessage.set(
            res.message ?? 'Tu contraseña ha sido restablecida correctamente.'
          );
          this.isLoading.set(false);
        },
        error: (err) => {
          const detail =
            err?.error?.error ??
            err?.error?.detail ??
            'El enlace es inválido o ha expirado. Solicita uno nuevo.';
          this.errorMessage.set(detail);
          this.isLoading.set(false);
        },
      });
  }
}
