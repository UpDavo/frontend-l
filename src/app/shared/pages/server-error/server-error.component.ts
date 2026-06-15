import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-server-error',
    standalone: true,
    imports: [RouterLink, ButtonModule],
    template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6 px-4 text-center">

      <div class="flex flex-col items-center gap-2">
        <span class="text-[8rem] font-black leading-none text-brand/20 select-none">500</span>
        <h1 class="text-2xl font-bold text-gray-700 -mt-4">Error del servidor</h1>
        <p class="text-gray-400 text-sm max-w-sm">
          Algo salió mal en el servidor. Intenta de nuevo en unos momentos.
        </p>
      </div>

      <div class="flex gap-3">
        <p-button
          label="Reintentar"
          icon="pi pi-refresh"
          [outlined]="true"
          [rounded]="true"
          (onClick)="reload()"
        />
        <p-button
          label="Ir al inicio"
          icon="pi pi-home"
          routerLink="/dashboard"
          [rounded]="true"
        />
      </div>

    </div>
  `,
})
export class ServerErrorComponent {
    reload(): void {
        window.location.reload();
    }
}
