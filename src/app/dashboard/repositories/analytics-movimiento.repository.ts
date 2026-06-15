import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface HeatmapFilter {
    año_inicio?: number;
    año_fin?: number;
    ciudades?: string[];
}

export interface PronosticoFilter {
    top_n?: number;
    meses_proyeccion?: number;
    año_inicio?: number;
    anios_reciente?: number;
    ciudades?: string[];
}

export interface HeatmapCell {
    dia_semana: number;
    dia_nombre: string;
    mes: number;
    mes_nombre: string;
    total_cantidad: number;
    total_neto: number;
    total_transacciones: number;
    intensidad: number;
}

export interface Proyeccion {
    mes: number;
    anio: number;
    mes_nombre: string;
    tipo: 'historico' | 'actual' | 'proyeccion';
    cantidad_proyectada: number;
    total_proyectado: number;
    cantidad_real: number | null;
    neto_real: number | null;
    cantidad_anio_anterior: number | null;
    neto_anio_anterior: number | null;
}

export interface TotalesGlobalesMes {
    neto_real: number;
    cantidad_real: number;
    neto_anio_anterior: number;
    cantidad_anio_anterior: number;
}

export interface PronosticoItem {
    item: string;
    descripcion: string;
    desc_repuesto: string;
    precio_unit_promedio: number;
    promedio_historico: number;
    total_revenue_proyectado: number;
    tendencia: 'creciente' | 'estable' | 'decreciente';
    r2: number;
    proyecciones: Proyeccion[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsMovimientoRepository {
    private readonly http = inject(HttpClient);
    private readonly BASE = `${environment.apiUrl}/analytics/movimiento`;

    getHeatmap(f: HeatmapFilter = {}): Observable<HeatmapCell[]> {
        let p = new HttpParams();
        if (f.año_inicio) p = p.set('año_inicio', f.año_inicio);
        if (f.año_fin)    p = p.set('año_fin', f.año_fin);
        f.ciudades?.forEach(c => { p = p.append('ciudad', c); });
        return this.http.get<HeatmapCell[]>(`${this.BASE}/heatmap/`, { params: p });
    }

    getPronostico(f: PronosticoFilter = {}): Observable<{ results: PronosticoItem[]; totales_globales: Record<string, TotalesGlobalesMes> }> {
        let p = new HttpParams();
        if (f.top_n)            p = p.set('top_n', f.top_n);
        if (f.meses_proyeccion) p = p.set('meses_proyeccion', f.meses_proyeccion);
        if (f.año_inicio)       p = p.set('año_inicio', f.año_inicio);
        if (f.anios_reciente)   p = p.set('anios_reciente', f.anios_reciente);
        f.ciudades?.forEach(c => { p = p.append('ciudad', c); });
        return this.http.get<{ results: PronosticoItem[]; totales_globales: Record<string, TotalesGlobalesMes> }>(`${this.BASE}/pronostico/`, { params: p });
    }
}
