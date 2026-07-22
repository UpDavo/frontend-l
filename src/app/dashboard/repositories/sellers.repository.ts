import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Vendedor {
    id: number;
    nombre: string;
}

export interface Cliente {
    id: number;
    codigo: string;
    nombre: string;
    estado: string;
    zona: string;
    provincia: string;
    ciudad: string;
    vendedor: number | null;
}

export interface MarcaVenta {
    marca_id: number;
    marca_nombre: string;
    anios: Record<string, number>;
    total_historico: number;
    primer_anio_compra: number | null;
    ultimo_anio_compra: number | null;
    en_riesgo: boolean;
}

export interface MarcaNoComprada {
    marca_id: number;
    marca_nombre: string;
}

export interface ProductoSugerido {
    item_codigo: string;
    descripcion: string;
    marca_nombre: string;
    precio_pvp: number | null;
    stock_bod_matriz: number | null;
}

export interface PagedResult<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ReporteCliente {
    cliente: {
        id: number;
        codigo: string;
        nombre: string;
        estado: string;
        zona: string;
        provincia: string;
        ciudad: string;
        vendedor: string | null;
    };
    resumen_anual: { anio: number; total_usd: number }[];
    marcas_compradas: MarcaVenta[];
    marcas_no_compradas: MarcaNoComprada[];
}

@Injectable({ providedIn: 'root' })
export class SellersRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/sellers`;

    getVendedores(search?: string): Observable<Vendedor[]> {
        let p = new HttpParams();
        if (search) p = p.set('search', search);
        return this.http.get<Vendedor[]>(`${this.BASE}/vendedores/`, { params: p });
    }

    getClientes(vendedorId: number, search?: string): Observable<Cliente[]> {
        let p = new HttpParams().set('vendedor_id', vendedorId);
        if (search) p = p.set('search', search);
        return this.http.get<Cliente[]>(`${this.BASE}/clientes/`, { params: p });
    }

    getReporte(clienteId: number): Observable<ReporteCliente> {
        return this.http.get<ReporteCliente>(`${this.BASE}/clientes/${clienteId}/reporte/`);
    }

    getProductosSugeridos(
        clienteId: number,
        opts: { page?: number; page_size?: number; search?: string; ordering?: string } = {},
    ): Observable<PagedResult<ProductoSugerido>> {
        let p = new HttpParams();
        if (opts.page) p = p.set('page', opts.page);
        if (opts.page_size) p = p.set('page_size', opts.page_size);
        if (opts.search) p = p.set('search', opts.search);
        if (opts.ordering) p = p.set('ordering', opts.ordering);
        return this.http.get<PagedResult<ProductoSugerido>>(
            `${this.BASE}/clientes/${clienteId}/productos-sugeridos/`, { params: p },
        );
    }
}
