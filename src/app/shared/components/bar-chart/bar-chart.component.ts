import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    template: `
        <div [style.height.px]="horizontal ? chartHeight : null">
            <canvas #canvas></canvas>
        </div>
    `,
})
export class BarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() labels: string[] = [];
    @Input() data: number[] = [];
    @Input() color: string | string[] = '#121212';
    @Input() horizontal = false;
    @Input() valuePrefix = '';
    @Input() aspectRatio = 2.5;

    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private chart: Chart | null = null;
    private viewReady = false;

    get chartHeight(): number {
        return Math.max(300, this.labels.length * 42);
    }

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
                maintainAspectRatio: !this.horizontal,
                aspectRatio: this.horizontal ? undefined : this.aspectRatio,
                indexAxis: this.horizontal ? 'y' : 'x',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = Number(context.raw ?? 0).toLocaleString('es-EC', {
                                    maximumFractionDigits: 2,
                                });
                                return `${this.valuePrefix}${value}`;
                            },
                        },
                    },
                },
                scales: this.horizontal
                    ? {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) =>
                                    `${this.valuePrefix}${Number(value).toLocaleString('es-EC')}`,
                            },
                        },
                        y: {
                            grid: { display: false },
                            ticks: {
                                autoSkip: false,
                                callback: (_value, index) => {
                                    const label = this.labels[index] ?? '';
                                    return label.length > 28 ? `${label.slice(0, 25)}…` : label;
                                },
                            },
                        },
                    }
                    : {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
            },
        });
    }
}
