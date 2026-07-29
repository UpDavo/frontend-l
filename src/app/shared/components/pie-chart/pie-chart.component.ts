import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const PALETTE = [
    '#121212','#404040','#737373','#a3a3a3','#d4d4d4',
    '#262626','#525252','#858585','#bdbdbd','#e5e5e5',
];

@Component({
    selector: 'app-pie-chart',
    standalone: true,
    template: `<canvas #canvas></canvas>`,
})
export class PieChartComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() labels: string[] = [];
    @Input() data: number[]   = [];

    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private chart: Chart | null = null;
    private viewReady = false;

    ngAfterViewInit(): void { this.viewReady = true; this.render(); }
    ngOnChanges(): void      { if (this.viewReady) this.render(); }
    ngOnDestroy(): void      { this.chart?.destroy(); }

    private render(): void {
        this.chart?.destroy();
        if (!this.data.length) return;
        this.chart = new Chart(this.canvasRef.nativeElement, {
            type: 'doughnut',
            data: {
                labels: this.labels,
                datasets: [{ data: this.data, backgroundColor: PALETTE, borderWidth: 2 }],
            },
            options: {
                responsive: true,
                aspectRatio: 2,
                cutout: '60%',
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
                },
            },
        });
    }
}
