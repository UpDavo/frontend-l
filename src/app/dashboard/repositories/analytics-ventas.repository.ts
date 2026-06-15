import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface VentasFilter {
    page?: number;
    page_size?: number;
    search?: string;
    año?: number | string;
    mes?: number | string;
    ciudad?: string;
    item?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsVentasRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/ventas`;

    list(f: VentasFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)         p = p.set('page', f.page);
        if (f.page_size)    p = p.set('page_size', f.page_size);
        if (f.search)       p = p.set('search', f.search);
        if (f.año)          p = p.set('año', f.año);
        if (f.mes)          p = p.set('mes', f.mes);
        if (f.ciudad)       p = p.set('ciudad', f.ciudad);
        if (f.item)         p = p.set('item', f.item);
        if (f.fecha_desde)  p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta)  p = p.set('fecha_hasta', f.fecha_hasta);
        return this.http.get(`${this.BASE}/`, { params: p });
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
