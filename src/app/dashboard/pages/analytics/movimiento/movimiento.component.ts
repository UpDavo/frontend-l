import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { MovimientoService } from '../../../services/analytics/movimiento.service';
import { HeatmapCell, PronosticoItem } from '../../../repositories/analytics-movimiento.repository';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';
import { AnalyticsVentasRepository } from '../../../repositories/analytics-ventas.repository';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
    selector: 'app-movimiento',
    standalone: true,
    imports: [CommonModule, FormsModule, Dialog, AlertBannerComponent, FilterBarComponent, MultiSelectComponent],
    templateUrl: './movimiento.component.html',
})
export class MovimientoComponent implements OnInit {
    readonly svc        = inject(MovimientoService);
    private readonly ventasRepo = inject(AnalyticsVentasRepository);

    readonly dias   = DIAS;
    readonly meses  = MESES_CORTO;

    fCiudades: string[] = [];
    fAnioInicio         = 2020;
    fTopN               = 20;
    fMesesProyeccion    = 6;
    fAniosReciente      = 2;
    ciudadesOpciones    = signal<string[]>([]);

    viewMode      = signal<'unidades' | 'dinero'>('dinero');
    mesSelIdx     = signal(0);

    readonly loading = computed(() => this.svc.loadingHeatmap() || this.svc.loadingProno());

    selectedItem = signal<PronosticoItem | null>(null);
    showDetail   = false;

    readonly heatmapMatrix = computed<(HeatmapCell | null)[][]>(() => {
        const matrix: (HeatmapCell | null)[][] = Array.from({ length: 7 }, () => Array(12).fill(null));
        for (const cell of this.svc.heatmap()) {
            matrix[cell.dia_semana][cell.mes - 1] = cell;
        }
        return matrix;
    });

    readonly pronosticoHeaders = computed<{ label: string; tipo: string }[]>(() => {
        const items = this.svc.pronostico();
        if (!items.length) return [];
        return items[0].proyecciones.map(p => ({
            label: `${p.mes_nombre} ${p.anio}`,
            tipo: p.tipo,
        }));
    });

    readonly mesActualIdx = computed<number>(() => {
        const headers = this.pronosticoHeaders();
        return headers.findIndex(h => h.tipo === 'actual');
    });

    /** Mes actual (0-indexed) para resaltar columna activa en heatmap */
    readonly mesActual = new Date().getMonth();

    ngOnInit(): void {
        this.ventasRepo.getCiudades().subscribe({ next: (c) => this.ciudadesOpciones.set(c) });
        this.loadAll();
    }

    loadAll(): void {
        const f = {
            ciudades: this.fCiudades.length ? this.fCiudades : undefined,
            año_inicio: this.fAnioInicio,
        };
        this.svc.loadHeatmap(f);
        this.svc.loadPronostico({ ...f, top_n: this.fTopN, meses_proyeccion: this.fMesesProyeccion, anios_reciente: this.fAniosReciente });
        // reset al mes actual después de cargar (computed mesActualIdx lo calcula)
        this.mesSelIdx.set(new Date().getMonth()); // mes actual = índice en proyecciones
    }

    reset(): void {
        this.fCiudades = [];
        this.fAnioInicio = 2020;
        this.fTopN = 20;
        this.fMesesProyeccion = 6;
        this.fAniosReciente = 2;
        this.loadAll();
    }

    intensidadClass(intensidad: number): string {
        if (intensidad === 0)   return 'bg-gray-100';
        if (intensidad < 0.15) return 'bg-gray-100';
        if (intensidad < 0.30) return 'bg-gray-200';
        if (intensidad < 0.45) return 'bg-gray-300';
        if (intensidad < 0.60) return 'bg-gray-400';
        if (intensidad < 0.75) return 'bg-gray-500';
        if (intensidad < 0.88) return 'bg-gray-700';
        return 'bg-[#121212]';
    }

    tendenciaIcon(t: PronosticoItem['tendencia']): string {
        return t === 'creciente' ? 'pi pi-arrow-up' : t === 'decreciente' ? 'pi pi-arrow-down' : 'pi pi-minus';
    }

    tendenciaClass(t: PronosticoItem['tendencia']): string {
        return t === 'creciente' ? 'text-emerald-600' : t === 'decreciente' ? 'text-red-500' : 'text-amber-500';
    }

    /** Valor de proyeccion para columna idx según viewMode */
    proyValor(item: PronosticoItem, idx: number): number {
        const p = item.proyecciones[idx];
        if (!p) return 0;
        return this.viewMode() === 'dinero' ? p.total_proyectado : p.cantidad_proyectada;
    }

    barWidth(item: PronosticoItem, maxValue: number): number {
        const idx = this.mesSelIdx();
        const val = this.viewMode() === 'dinero'
            ? (item.proyecciones[idx]?.total_proyectado ?? 0)
            : (item.proyecciones[idx]?.cantidad_proyectada ?? 0);
        return maxValue > 0 ? Math.round((val / maxValue) * 100) : 0;
    }

    readonly maxProxMes = computed<number>(() => {
        const items = this.svc.pronostico();
        const idx   = this.mesSelIdx();
        if (!items.length) return 1;
        return Math.max(...items.map(i =>
            this.viewMode() === 'dinero'
                ? (i.proyecciones[idx]?.total_proyectado ?? 0)
                : (i.proyecciones[idx]?.cantidad_proyectada ?? 0)
        )) || 1;
    });

    openDetail(item: PronosticoItem): void {
        this.selectedItem.set(item);
        this.showDetail = true;
    }

    totalProyectadoGeneral(item: PronosticoItem): number {
        return item.proyecciones.reduce((s, p) => s + p.total_proyectado, 0);
    }

    totalRealGeneral(item: PronosticoItem): number {
        return item.proyecciones.reduce((s, p) => s + (p.neto_real ?? 0), 0);
    }

    totalRevenueGlobal(): number {
        return this.svc.pronostico().reduce((s, i) => s + i.total_revenue_proyectado, 0);
    }

    cumplimientoPct(item: PronosticoItem): number | null {
        const p = item.proyecciones[this.mesSelIdx()];
        if (!p || p.tipo === 'proyeccion') return null;
        const real = this.viewMode() === 'dinero' ? (p.neto_real ?? 0) : (p.cantidad_real ?? 0);
        const proy = this.viewMode() === 'dinero' ? p.total_proyectado : p.cantidad_proyectada;
        return proy > 0 ? Math.round((real / proy) * 100) : null;
    }

    realValor(item: PronosticoItem): number {
        const p = item.proyecciones[this.mesSelIdx()];
        if (!p) return 0;
        return this.viewMode() === 'dinero' ? (p.neto_real ?? 0) : (p.cantidad_real ?? 0);
    }

    tipoMesSel = computed<'historico' | 'actual' | 'proyeccion' | null>(() => {
        const items = this.svc.pronostico();
        if (!items.length) return null;
        return items[0].proyecciones[this.mesSelIdx()]?.tipo ?? null;
    });

    readonly summaryMes = computed(() => {
        const items = this.svc.pronostico();
        const idx   = this.mesSelIdx();
        const vm    = this.viewMode();
        if (!items.length) return null;
        const p0 = items[0].proyecciones[idx];
        if (!p0) return null;

        const tipo         = p0.tipo;
        const anioSel      = p0.anio;
        const mesNombreSel = p0.mes_nombre;
        const mesKey       = String(p0.mes);

        // For past/current months: use ALL products from DB (not filtered to top-N)
        const globals = this.svc.totalesGlobales()[mesKey];
        let totalReal     = 0;
        let totalAnterior = 0;
        if (tipo !== 'proyeccion' && globals) {
            totalReal     = vm === 'dinero' ? globals.neto_real         : globals.cantidad_real;
            totalAnterior = vm === 'dinero' ? globals.neto_anio_anterior : globals.cantidad_anio_anterior;
        }

        // Projected total always from top-N regression model
        let totalProy = 0;
        for (const item of items) {
            const p = item.proyecciones[idx];
            if (!p) continue;
            totalProy += vm === 'dinero' ? p.total_proyectado : p.cantidad_proyectada;
        }

        const pctVsAnterior = totalAnterior > 0 && tipo !== 'proyeccion'
            ? Math.round(((totalReal - totalAnterior) / totalAnterior) * 100) : null;

        return { totalReal, totalProy, totalAnterior, pctVsAnterior, tipo, anioSel, mesNombreSel };
    });

    readonly pronosticoOrdenado = computed(() => {
        const items = [...this.svc.pronostico()];
        const tipo  = this.tipoMesSel();
        if (tipo === 'proyeccion') return items;
        const idx = this.mesSelIdx();
        return items.sort((a, b) => {
            const ra = this.viewMode() === 'dinero'
                ? (a.proyecciones[idx]?.neto_real ?? 0)
                : (a.proyecciones[idx]?.cantidad_real ?? 0);
            const rb = this.viewMode() === 'dinero'
                ? (b.proyecciones[idx]?.neto_real ?? 0)
                : (b.proyecciones[idx]?.cantidad_real ?? 0);
            return rb - ra;
        });
    });
}
