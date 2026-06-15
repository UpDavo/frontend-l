import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TitleStrategy } from '@angular/router';
import { AppTitleStrategy } from './core/strategies/app-title.strategy';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const RevlyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '#9B85FF',
      500: '#8A70FF',
      600: '#775CFF',
      700: '#6344E6',
      800: '#5035CC',
      900: '#3D26B3',
      950: '#2A1A80',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    providePrimeNG({
      theme: {
        preset: RevlyPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
