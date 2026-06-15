import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthStore } from '../../../core/store/auth.store';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MessageResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
} from './auth.models';

/**
 * AuthService — fachada del AuthStore (NgRx Signals).
 *
 * Los componentes y guards usan este servicio.
 * Toda la lógica de estado está centralizada en AuthStore.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(AuthStore);
  private readonly repo = inject(AuthRepository);

  // ── Signals expuestos (reactivos) ──────────────────
  readonly user = this.store.user;
  readonly isAuthenticated = this.store.isAuthenticated;
  readonly isLoggingOut = this.store.isLoggingOut;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly fullName = this.store.fullName;
  readonly initials = this.store.initials;
  readonly role = this.store.role;
  readonly isAdmin = this.store.isAdmin;
  readonly permissions = this.store.permissions;
  /** Token actual (para el interceptor) */
  get token(): string | null {
    return this.store.getToken();
  }

  /** Login vía rxMethod — dispara el flujo reactivo */
  login(credentials: LoginRequest): void {
    this.store.login(credentials);
  }

  /** Refresh — retorna Observable para los guards */
  refresh(): Observable<AuthResponse | null> {
    return this.store.refresh();
  }

  /** Logout — retorna Observable */
  logout(): Observable<void | undefined> {
    return this.store.logout();
  }

  /**
   * Solicita el envío del correo de recuperación de contraseña.
   * No modifica el estado del store — es un flujo estático.
   */
  requestPasswordReset(payload: PasswordResetRequest): Observable<MessageResponse> {
    return this.repo.requestPasswordReset(payload);
  }

  /**
   * Confirma el reset de contraseña con uid + token + nueva contraseña.
   * No modifica el estado del store — el usuario debe hacer login después.
   */
  confirmPasswordReset(payload: PasswordResetConfirmRequest): Observable<MessageResponse> {
    return this.repo.confirmPasswordReset(payload);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Si el servidor responde con éxito, el usuario debe iniciar sesión nuevamente.
   */
  changePassword(payload: ChangePasswordRequest): Observable<MessageResponse> {
    return this.repo.changePassword(payload);
  }
}
