import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <i class="pi pi-lock text-6xl text-red-400 opacity-60"></i>
      <h2 class="text-2xl font-semibold text-gray-700">Acceso no autorizado</h2>
      <p class="text-gray-400 text-sm">No tienes acceso a este recurso.</p>
      <a routerLink="/dashboard"
         class="mt-2 text-sm text-brand hover:underline font-medium">
        Volver al inicio
      </a>
    </div>
  `,
})
export class UnauthorizedComponent { }
