import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    template: `<canvas #canvas></canvas>`,
})
export class BarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() labels: string[] = [];
    @Input() data: number[] = [];
    @Input() color: string | string[] = '#775cff';

    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private chart: Chart | null = null;
    private viewReady = false;

    ngAfterViewInit(): void {
        this.viewReady = true;
        this.render();
    }

    ngOnChanges(): void {
        if (this.viewReady) this.render();
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
    }

    private render(): void {
        this.chart?.destroy();
        this.chart = new Chart(this.canvasRef.nativeElement, {
            type: 'bar',
            data: {
                labels: this.labels,
                datasets: [{ data: this.data, backgroundColor: this.color, borderRadius: 6 }],
            },
            options: {
                responsive: true,
                aspectRatio: 2.5,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            },
        });
    }
}
