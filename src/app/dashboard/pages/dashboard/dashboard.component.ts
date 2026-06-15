import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { BarChartComponent } from '../../../shared/components/bar-chart/bar-chart.component';
import { PieChartComponent } from '../../../shared/components/pie-chart/pie-chart.component';

function currentMonthRange(): { desde: string; hasta: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { desde: fmt(new Date(y, m, 1)), hasta: fmt(new Date(y, m + 1, 0)) };
}

interface ChartItem { label: string; value: number; }

interface DashboardResumen {
    periodo: { desde: string; hasta: string };
    ventas: { total_neto: number; total_registros: number; por_ciudad: ChartItem[]; por_asesor: ChartItem[]; };
    stock:  { total_items: number; total_pvp: number; por_estado: ChartItem[]; por_marca: ChartItem[]; };
    importaciones: { total_cif: number; total_registros: number; por_pais: ChartItem[]; por_importador: ChartItem[]; };
}

@Component({
    selector: 'app-logeado',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, BarChartComponent, PieChartComponent],
    templateUrl: './dashboard.component.html',
})
export class LogeadoComponent implements OnInit {
    private readonly http = inject(HttpClient);

    fFechaDesde = currentMonthRange().desde;
    fFechaHasta = currentMonthRange().hasta;

    resumen  = signal<DashboardResumen | null>(null);
    loading  = signal(false);

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading.set(true);
        let p = new HttpParams()
            .set('fecha_desde', this.fFechaDesde)
            .set('fecha_hasta', this.fFechaHasta);
        this.http.get<DashboardResumen>(`${environment.apiUrl}/analytics/resumen/`, { params: p })
            .subscribe({
                next: (res) => { this.resumen.set(res); this.loading.set(false); },
                error: ()    => { this.loading.set(false); },
            });
    }

    labels(items: ChartItem[]): string[] { return items.map(i => i.label); }
    values(items: ChartItem[]): number[] { return items.map(i => i.value); }

    reset(): void {
        const { desde, hasta } = currentMonthRange();
        this.fFechaDesde = desde;
        this.fFechaHasta = hasta;
        this.load();
    }
}
