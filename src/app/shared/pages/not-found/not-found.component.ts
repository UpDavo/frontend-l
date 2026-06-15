import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink, ButtonModule],
    template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6 px-4 text-center">

      <div class="flex flex-col items-center gap-2">
        <span class="text-[8rem] font-black leading-none text-brand/20 select-none">404</span>
        <h1 class="text-2xl font-bold text-gray-700 -mt-4">Página no encontrada</h1>
        <p class="text-gray-400 text-sm max-w-sm">
          La ruta que buscas no existe o fue movida.
        </p>
      </div>

      <p-button
        label="Volver al inicio"
        icon="pi pi-home"
        routerLink="/dashboard"
        [rounded]="true"
      />

    </div>
  `,
})
export class NotFoundComponent { }
