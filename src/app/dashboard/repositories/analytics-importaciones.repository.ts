import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ImportacionesFilter {
    page?: number;
    page_size?: number;
    search?: string;
    año?: number | string;
    importador?: string;
    pais_origen?: string;
    marca?: string;
    tipo_importacion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsImportacionesRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/importaciones`;

    list(f: ImportacionesFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)              p = p.set('page', f.page);
        if (f.page_size)         p = p.set('page_size', f.page_size);
        if (f.search)            p = p.set('search', f.search);
        if (f.año)               p = p.set('año', f.año);
        if (f.importador)        p = p.set('importador', f.importador);
        if (f.pais_origen)       p = p.set('pais_origen', f.pais_origen);
        if (f.marca)             p = p.set('marca', f.marca);
        if (f.tipo_importacion)  p = p.set('tipo_importacion', f.tipo_importacion);
        if (f.fecha_desde)       p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta)       p = p.set('fecha_hasta', f.fecha_hasta);
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
