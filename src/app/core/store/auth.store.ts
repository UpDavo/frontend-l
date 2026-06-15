import {
    signalStore,
    withState,
    withComputed,
    withMethods,
    patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, EMPTY } from 'rxjs';
import { AuthResponse, LoginRequest, User } from '../../auth/services/auth/auth.models';
import { AuthRepository } from '../../auth/repositories/auth.repository';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    csrfToken: string | null;
    status: AuthStatus;
    error: string | null;
    isLoggingOut: boolean;
}

const SESSION_KEY = 'auth_session';

function loadFromSession(): Partial<AuthState> {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Partial<AuthState>;
    } catch {
        return {};
    }
}

function saveToSession(state: Partial<AuthState>): void {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch { /* nada */ }
}

function clearSession(): void {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch { /* nada */ }
}

const saved = loadFromSession();

const initialState: AuthState = {
    user: saved.user ?? null,
    accessToken: saved.accessToken ?? null,
    csrfToken: saved.csrfToken ?? null,
    status: saved.accessToken ? 'authenticated' : 'idle',
    error: null,
    isLoggingOut: false,
};

export const AuthStore = signalStore(
    { providedIn: 'root' },

    withState(initialState),

    withComputed((store) => ({
        isAuthenticated: computed(() => !!store.accessToken()),
        isLoggingOut: computed(() => store.isLoggingOut()),
        isLoading: computed(() => store.status() === 'loading'),
        fullName: computed(() => {
            const u = store.user();
            if (!u) return '';
            return `${u.first_name} ${u.last_name}`.trim();
        }),
        initials: computed(() => {
            const u = store.user();
            if (!u) return '';
            return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
        }),
        role: computed(() => store.user()?.role ?? null),
        isAdmin: computed(() => store.user()?.role?.is_admin === true),
        permissions: computed(() => store.user()?.role?.permissions ?? []),
    })),

    withMethods((store) => {
        const repo = inject(AuthRepository);
        const router = inject(Router);

        function handleAuthResponse(response: AuthResponse): void {
            const patch = {
                user: response.user,
                accessToken: response.access_token,
                csrfToken: response.csrf_token ?? null,
                status: 'authenticated' as AuthStatus,
                error: null,
            };
            patchState(store, patch);
            saveToSession({
                user: patch.user,
                accessToken: patch.accessToken,
                csrfToken: patch.csrfToken,
            });
        }

        function clearAuthSession(): void {
            clearSession();
            patchState(store, {
                user: null,
                accessToken: null,
                csrfToken: null,
                status: 'idle',
                error: null,
            });
        }

        return {
            login: rxMethod<LoginRequest>(
                pipe(
                    tap(() => patchState(store, { status: 'loading', error: null })),
                    switchMap((credentials) =>
                        repo.login(credentials).pipe(
                            tap((response) => {
                                handleAuthResponse(response);
                                router.navigate(['/dashboard']);
                            }),
                            catchError((err) => {
                                let errorMsg = 'Ocurrió un error inesperado.';
                                if (err.status === 401) {
                                    errorMsg = 'Credenciales incorrectas. Intente de nuevo.';
                                } else if (err.status === 0) {
                                    errorMsg = 'No se pudo conectar con el servidor.';
                                } else {
                                    errorMsg = err.error?.detail || err.error?.message || errorMsg;
                                }
                                patchState(store, { status: 'error', error: errorMsg });
                                return EMPTY;
                            })
                        )
                    )
                )
            ),

            refresh() {
                patchState(store, { status: 'loading', error: null });
                return repo.refresh().pipe(
                    tap((response) => handleAuthResponse(response)),
                    catchError(() => {
                        clearAuthSession();
                        return of(null);
                    })
                );
            },

            logout() {
                patchState(store, { isLoggingOut: true });
                clearAuthSession();
                router.navigate(['/auth/login']);
                repo.logout().subscribe({ error: () => { /* ignorar */ } });
                return of(undefined);
            },

            getToken(): string | null {
                return store.accessToken();
            },
        };
    })
);
