import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ImportacionesFilter {
    page?: number;
    page_size?: number;
    search?: string;
    importadores?: string[];
    paises_origen?: string[];
    marcas?: string[];
    tipo_importacion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface ImportacionOpciones {
    importadores: string[];
    paises_origen: string[];
    marcas: string[];
}

export interface ImportacionMetricas {
    total_cif: number;
    total_registros: number;
}

export type ImportacionMetricasFilter = Pick<ImportacionesFilter, 'importadores' | 'paises_origen' | 'marcas' | 'fecha_desde' | 'fecha_hasta'>;

@Injectable({ providedIn: 'root' })
export class AnalyticsImportacionesRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/importaciones`;

    list(f: ImportacionesFilter = {}): Observable<any> {
        let p = new HttpParams();
        if (f.page)             p = p.set('page', f.page);
        if (f.page_size)        p = p.set('page_size', f.page_size);
        if (f.search)           p = p.set('search', f.search);
        if (f.tipo_importacion) p = p.set('tipo_importacion', f.tipo_importacion);
        if (f.fecha_desde)      p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta)      p = p.set('fecha_hasta', f.fecha_hasta);
        f.importadores?.forEach(v =>  { p = p.append('importador', v); });
        f.paises_origen?.forEach(v => { p = p.append('pais_origen', v); });
        f.marcas?.forEach(v =>        { p = p.append('marca', v); });
        return this.http.get(`${this.BASE}/`, { params: p });
    }

    getOpciones(): Observable<ImportacionOpciones> {
        return this.http.get<ImportacionOpciones>(`${this.BASE}/opciones/`);
    }

    getMetricas(f: ImportacionMetricasFilter = {}): Observable<ImportacionMetricas> {
        let p = new HttpParams();
        if (f.fecha_desde)      p = p.set('fecha_desde', f.fecha_desde);
        if (f.fecha_hasta)      p = p.set('fecha_hasta', f.fecha_hasta);
        f.importadores?.forEach(v =>  { p = p.append('importador', v); });
        f.paises_origen?.forEach(v => { p = p.append('pais_origen', v); });
        f.marcas?.forEach(v =>        { p = p.append('marca', v); });
        return this.http.get<ImportacionMetricas>(`${this.BASE}/metricas/`, { params: p });
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
