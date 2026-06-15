import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
} from '../services/auth/auth.models';
import { environment } from '../../../../environments/environment';

/**
 * AuthRepository — capa de acceso a la API de autenticación.
 *
 * Solo se encarga de las llamadas HTTP.
 * No maneja estado, navegación ni lógica de negocio.
 */
@Injectable({ providedIn: 'root' })
export class AuthRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE_URL = `${environment.apiUrl}/auth`;

    /**
     * POST /auth/login/
     * El servidor setea automáticamente la cookie httpOnly refreshToken.
     */
    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.BASE_URL}/login/`,
            credentials,
            { withCredentials: true }
        );
    }

    /**
     * POST /auth/refresh/
     * No necesita body. La cookie refreshToken se envía automáticamente.
     */
    refresh(): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.BASE_URL}/refresh/`,
            {},
            { withCredentials: true }
        );
    }

    /**
     * POST /auth/logout/
     * Envía Bearer token + cookie refreshToken automáticamente.
     */
    logout(): Observable<void> {
        return this.http.post<void>(
            `${this.BASE_URL}/logout/`,
            {},
            { withCredentials: true }
        );
    }

    /**
     * POST /auth/password-reset/
     * Solicita el envio del email de recuperación.
     */
    requestPasswordReset(payload: PasswordResetRequest): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(
            `${this.BASE_URL}/password-reset/`,
            payload
        );
    }

    /**
     * POST /auth/password-reset-confirm/
     * Confirma el reset con uid + token + nueva contraseña.
     */
    confirmPasswordReset(payload: PasswordResetConfirmRequest): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(
            `${this.BASE_URL}/password-reset-confirm/`,
            payload
        );
    }

    /**
     * POST /auth/change-password/
     * Cambia la contraseña del usuario autenticado.
     */
    changePassword(payload: ChangePasswordRequest): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(
            `${this.BASE_URL}/change-password/`,
            payload
        );
    }

    /**
     * PATCH /auth/tutorial-complete/
     * Marca el tutorial de onboarding como completado para el usuario.
     */
    markTutorialComplete(): Observable<MessageResponse> {
        return this.http.patch<MessageResponse>(
            `${this.BASE_URL}/tutorial-complete/`,
            {},
            { withCredentials: true }
        );
    }
}
