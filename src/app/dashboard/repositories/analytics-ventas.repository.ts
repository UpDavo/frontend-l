import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface VentasFilter {
    page?: number;
    page_size?: number;
    search?: string;
    ciudades?: string[];
    item?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface VentaMetricas {
    total_actual: number;
    total_anio_anterior: number;
    variacion_pct: number | null;
    periodo_actual: { desde: string; hasta: string };
    periodo_anterior: { desde: string; hasta: string };
    anio_primer_registro: number | null;
}

export type MetricasFilter = Pick<VentasFilter, 'ciudades' | 'item' | 'fecha_desde' | 'fecha_hasta'>;

@Injectable({ providedIn: 'root' })
export class AnalyticsVentasRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/ventas`;

    list(f: VentasFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)                 p = p.set('page', f.page);
        if (f.page_size)            p = p.set('page_size', f.page_size);
        if (f.search)               p = p.set('search', f.search);
        f.ciudades?.forEach(c =>  { p = p.append('ciudad', c); });
        if (f.item)                 p = p.set('item', f.item);
        if (f.fecha_desde)          p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta)          p = p.set('fecha_hasta', f.fecha_hasta);
        return this.http.get(`${this.BASE}/`, { params: p });
    }

    getCiudades(): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE}/ciudades/`);
    }

    getMetricas(f: MetricasFilter = {}): Observable<VentaMetricas> {
        let p = new HttpParams();
        f.ciudades?.forEach(c => { p = p.append('ciudad', c); });
        if (f.item)        p = p.set('item', f.item);
        if (f.fecha_desde) p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta) p = p.set('fecha_hasta', f.fecha_hasta);
        return this.http.get<VentaMetricas>(`${this.BASE}/metricas/`, { params: p });
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.BASE}/${id}/`);
    }

    create(body: any): Observable<any> {
        return this.http.post(`${this.BASE}/`, body);
    }

    update(id: number, body: any): Observable<any> {
        return this.http.put(`${this.BASE}/${id}/`, body);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.BASE}/${id}/`);
    }
}
