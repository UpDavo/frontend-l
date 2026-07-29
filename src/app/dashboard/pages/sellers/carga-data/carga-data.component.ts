import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SellersService } from '../../../services/sellers/sellers.service';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { SelectSearchComponent, SelectOption } from '../../../../shared/components/select-search/select-search.component';

@Component({
    selector: 'app-sellers-carga-data',
    standalone: true,
    imports: [CommonModule, FormsModule, AlertBannerComponent, SelectSearchComponent],
    templateUrl: './carga-data.component.html',
})
export class SellersCargaDataComponent {
    private readonly router = inject(Router);
    readonly svc = inject(SellersService);

    readonly paso3File = signal<File | null>(null);
    readonly paso3ClienteIndex = signal<number | null>(null);

    readonly vendedorExistenteOptions = computed<SelectOption[]>(
        () => this.svc.cargaVendedoresExistentes().map((v) => ({ id: v.id, label: v.nombre })),
    );

    readonly clienteOptions = computed<SelectOption[]>(
        () => this.svc.cargaClientes().map((c, i) => ({ id: i, label: `${c.codigo} · ${c.nombre}` })),
    );

    readonly progresoPct = computed(() => {
        const total = this.svc.procesoTotalPasos();
        if (!total) return 0;
        return Math.round((this.svc.procesoPasoActual() / total) * 100);
    });

    readonly puedeProcesar = computed(() => {
        if (this.svc.procesando()) return false;
        const modoNuevo = this.svc.cargaModo() === 'nuevo';
        if (modoNuevo && !this.svc.cargaPaso1Preview()) return false;
        if (!this.svc.cargaPaso2Preview() && !this.svc.cargaProductosEntries().length) return false;
        return true;
    });

    elegirModo(modo: 'nuevo' | 'existente'): void {
        this.svc.elegirModo(modo);
        this.paso3File.set(null);
        this.paso3ClienteIndex.set(null);
    }

    onVendedorExistenteChange(vendedorId: number | null): void {
        this.svc.seleccionarVendedorExistente(vendedorId);
    }

    descargarPlantilla(tipo: 'vendedor-cliente' | 'cliente-marca' | 'productos'): void {
        this.svc.descargarPlantillaCargaData(tipo);
    }

    onPaso1FileSelected(event: Event): void {
        const file = this.extractFile(event);
        if (file) this.svc.previsualizarPaso1(file);
    }

    onPaso2FileSelected(event: Event): void {
        const file = this.extractFile(event);
        if (file) this.svc.previsualizarPaso2(file);
    }

    onPaso3FileSelected(event: Event): void {
        this.paso3File.set(this.extractFile(event));
    }

    agregarProducto(): void {
        const file = this.paso3File();
        const index = this.paso3ClienteIndex();
        if (!file || index === null) return;
        const cliente = this.svc.cargaClientes()[index];
        if (!cliente) return;
        this.svc.previsualizarYAgregarProducto(file, cliente.codigo, cliente.nombre);
        this.paso3File.set(null);
        this.paso3ClienteIndex.set(null);
    }

    procesarTodo(): void {
        this.svc.procesarTodo(() => {});
    }

    empezarOtroVendedor(): void {
        this.svc.resetCargaData();
        this.paso3File.set(null);
        this.paso3ClienteIndex.set(null);
    }

    verReporte(): void {
        this.router.navigate(['/dashboard/sellers/report']);
    }

    private extractFile(event: Event): File | null {
        const input = event.target as HTMLInputElement;
        return input.files?.[0] ?? null;
    }
}
