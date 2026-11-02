import { Component, DestroyRef, ElementRef, effect, inject, input, viewChild } from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);
Chart.defaults.font.family = "'Nunito', system-ui, sans-serif";
Chart.defaults.color = '#7a6a5c';

export type TipoGrafico = 'bar' | 'line' | 'doughnut';

const PRIMARIO = '#e4572e';
const PALETA = [
  '#e4572e',
  '#f2a23a',
  '#2e7d32',
  '#1565c0',
  '#8e44ad',
  '#c94620',
  '#00897b',
  '#d81b60',
  '#6d4c41',
  '#546e7a',
];

@Component({
  selector: 'app-grafico',
  template: `<canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>`,
  styles: `
    :host {
      display: block;
      position: relative;
      height: var(--alto, 300px);
    }
  `,
})
export class Grafico {
  readonly tipo = input.required<TipoGrafico>();
  readonly etiquetas = input.required<string[]>();
  readonly valores = input.required<number[]>();
  readonly nombreSerie = input('Cantidad');
  readonly horizontal = input(false);
  readonly descripcion = input('Gráfico');

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    effect(() => {
      const configuracion = this.configuracion();
      this.grafico?.destroy();
      this.grafico = new Chart(this.lienzo().nativeElement, configuracion);
    });
    inject(DestroyRef).onDestroy(() => this.grafico?.destroy());
  }

  private configuracion(): ChartConfiguration {
    const tipo = this.tipo();
    const esTorta = tipo === 'doughnut';
    const etiquetas = this.etiquetas();

    return {
      type: tipo,
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: this.nombreSerie(),
            data: this.valores(),
            backgroundColor: esTorta
              ? etiquetas.map((_, i) => PALETA[i % PALETA.length])
              : tipo === 'line'
                ? 'rgba(228, 87, 46, 0.15)'
                : PRIMARIO,
            borderColor: esTorta ? '#fff' : PRIMARIO,
            borderWidth: esTorta ? 2 : tipo === 'line' ? 2.5 : 0,
            borderRadius: tipo === 'bar' ? 6 : 0,
            fill: tipo === 'line',
            tension: 0.3,
            pointRadius: tipo === 'line' ? 3 : 0,
            pointBackgroundColor: PRIMARIO,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: this.horizontal() ? 'y' : 'x',
        plugins: {
          legend: { display: esTorta, position: 'bottom' },
        },
        scales: esTorta
          ? {}
          : {
              x: { grid: { display: false }, ticks: { precision: 0 } },
              y: { beginAtZero: true, ticks: { precision: 0 } },
            },
      },
    } as ChartConfiguration;
  }
}
