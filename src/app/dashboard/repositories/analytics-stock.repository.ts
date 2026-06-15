import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface StockFilter {
    page?: number;
    page_size?: number;
    search?: string;
    marcas?: string[];
    fabricas?: string[];
    estados?: string[];
    categorias?: string[];
    linea?: string;
    ordering?: string;
}

export interface StockOpciones {
    marcas: string[];
    fabricas: string[];
    estados: string[];
    categorias: string[];
}

export interface StockMetricas {
    total_pvp: number;
    total_items: number;
}

export type StockMetricasFilter = Pick<StockFilter, 'marcas' | 'fabricas' | 'estados' | 'categorias' | 'search'>;

@Injectable({ providedIn: 'root' })
export class AnalyticsStockRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/stock`;

    list(f: StockFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)      p = p.set('page', f.page);
        if (f.page_size) p = p.set('page_size', f.page_size);
        if (f.search)    p = p.set('search', f.search);
        if (f.linea)     p = p.set('linea', f.linea);
        if (f.ordering)  p = p.set('ordering', f.ordering);
        f.marcas?.forEach(v =>     { p = p.append('marca', v); });
        f.fabricas?.forEach(v =>   { p = p.append('fabrica', v); });
        f.estados?.forEach(v =>    { p = p.append('estado_stock', v); });
        f.categorias?.forEach(v => { p = p.append('categoria', v); });
        return this.http.get(`${this.BASE}/`, { params: p });
    }

    getOpciones(): Observable<StockOpciones> {
        return this.http.get<StockOpciones>(`${this.BASE}/opciones/`);
    }

    getMetricas(f: StockMetricasFilter = {}): Observable<StockMetricas> {
        let p = new HttpParams();
        if (f.search) p = p.set('search', f.search);
        f.marcas?.forEach(v =>     { p = p.append('marca', v); });
        f.fabricas?.forEach(v =>   { p = p.append('fabrica', v); });
        f.estados?.forEach(v =>    { p = p.append('estado_stock', v); });
        f.categorias?.forEach(v => { p = p.append('categoria', v); });
        return this.http.get<StockMetricas>(`${this.BASE}/metricas/`, { params: p });
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
