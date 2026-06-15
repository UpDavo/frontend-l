import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface StockFilter {
    page?: number;
    page_size?: number;
    search?: string;
    marca?: string;
    fabrica?: string;
    estado_stock?: string;
    categoria?: string;
    linea?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsStockRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/stock`;

    list(f: StockFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)         p = p.set('page', f.page);
        if (f.page_size)    p = p.set('page_size', f.page_size);
        if (f.search)       p = p.set('search', f.search);
        if (f.marca)        p = p.set('marca', f.marca);
        if (f.fabrica)      p = p.set('fabrica', f.fabrica);
        if (f.estado_stock) p = p.set('estado_stock', f.estado_stock);
        if (f.categoria)    p = p.set('categoria', f.categoria);
        if (f.linea)        p = p.set('linea', f.linea);
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
