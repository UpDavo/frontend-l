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

const HeimdalPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f5f5f5',
      100: '#e5e5e5',
      200: '#d4d4d4',
      300: '#a3a3a3',
      400: '#737373',
      500: '#525252',
      600: '#121212',
      700: '#0a0a0a',
      800: '#050505',
      900: '#000000',
      950: '#000000',
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
        preset: HeimdalPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
