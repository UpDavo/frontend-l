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

export interface ClienteVentaHistorica {
    cliente_id: number;
    codigo: string;
    nombre: string;
    total_historico: number;
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

export interface ProductoMarca {
    item_codigo: string;
    descripcion: string;
    marca_nombre: string;
    precio_pvp: number | null;
    stock_bod_matriz: number | null;
    total_cantidad: number;
    total_compra: number;
}

export interface CargaDataClienteBasico {
    codigo: string;
    nombre: string;
}

export interface CargaVendedorClientePreview {
    filas: number;
    vendedor_nombre: string | null;
    vendedores_nuevos: number;
    vendedores_existentes: number;
    clientes_nuevos: number;
    clientes_existentes: number;
    clientes: CargaDataClienteBasico[];
}

export interface CargaVendedorClienteResumen {
    vendedor_id: number | null;
    vendedor_nombre: string | null;
    vendedores: number;
    clientes: { id: number; codigo: string; nombre: string }[];
}

export interface CargaClienteMarcaPreview {
    filas: number;
    marcas_nuevas: number;
    marcas_existentes: number;
    ventas_cliente_marca_anio: number;
    ventas_nuevas: number;
    ventas_existentes: number;
}

export interface CargaClienteMarcaResumen {
    marcas: number;
    ventas_cliente_marca_anio: number;
}

export interface CargaProductosPreview {
    cliente_codigo: string;
    filas: number;
    marcas_nuevas: number;
    marcas_existentes: number;
    productos_nuevos: number;
    productos_existentes: number;
    ventas_producto_mensual: number;
    ventas_nuevas: number;
    ventas_existentes: number;
}

export interface CargaProductosResumen {
    cliente_codigo: string;
    cliente_nombre: string;
    productos: number;
    ventas_producto_mensual: number;
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

    getVentasHistoricasClientes(vendedorId: number): Observable<ClienteVentaHistorica[]> {
        return this.http.get<ClienteVentaHistorica[]>(
            `${this.BASE}/vendedores/${vendedorId}/clientes/ventas-historicas/`,
        );
    }

    getReporte(clienteId: number): Observable<ReporteCliente> {
        return this.http.get<ReporteCliente>(`${this.BASE}/clientes/${clienteId}/reporte/`);
    }

    getProductosMarca(
        clienteId: number,
        marcaId: number,
        opts: { page?: number; page_size?: number; search?: string; ordering?: string } = {},
    ): Observable<PagedResult<ProductoMarca>> {
        let p = new HttpParams();
        if (opts.page) p = p.set('page', opts.page);
        if (opts.page_size) p = p.set('page_size', opts.page_size);
        if (opts.search) p = p.set('search', opts.search);
        if (opts.ordering) p = p.set('ordering', opts.ordering);
        return this.http.get<PagedResult<ProductoMarca>>(
            `${this.BASE}/clientes/${clienteId}/marcas/${marcaId}/productos/`, { params: p },
        );
    }

    descargarPlantillaCargaData(tipo: 'vendedor-cliente' | 'cliente-marca' | 'productos'): Observable<Blob> {
        return this.http.get(`${this.BASE}/carga-data/plantilla/${tipo}/`, { responseType: 'blob' });
    }

    previsualizarVendedorCliente(file: File): Observable<CargaVendedorClientePreview> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<CargaVendedorClientePreview>(`${this.BASE}/carga-data/vendedor-cliente/preview/`, formData);
    }

    aplicarVendedorCliente(file: File): Observable<CargaVendedorClienteResumen> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<CargaVendedorClienteResumen>(`${this.BASE}/carga-data/vendedor-cliente/`, formData);
    }

    previsualizarClienteMarca(file: File): Observable<CargaClienteMarcaPreview> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<CargaClienteMarcaPreview>(`${this.BASE}/carga-data/cliente-marca/preview/`, formData);
    }

    aplicarClienteMarca(file: File): Observable<CargaClienteMarcaResumen> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<CargaClienteMarcaResumen>(`${this.BASE}/carga-data/cliente-marca/`, formData);
    }

    previsualizarProductos(file: File, clienteCodigo: string): Observable<CargaProductosPreview> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cliente_codigo', clienteCodigo);
        return this.http.post<CargaProductosPreview>(`${this.BASE}/carga-data/productos/preview/`, formData);
    }

    aplicarProductos(file: File, clienteCodigo: string): Observable<CargaProductosResumen> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cliente_codigo', clienteCodigo);
        return this.http.post<CargaProductosResumen>(`${this.BASE}/carga-data/productos/`, formData);
    }
}
