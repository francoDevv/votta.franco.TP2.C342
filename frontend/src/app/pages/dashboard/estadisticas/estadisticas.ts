import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../../../models/estadisticas';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { mensajesDeError } from '../../../shared/errores';
import { Grafico } from '../../../shared/grafico/grafico';

const DIA_MS = 24 * 60 * 60 * 1000;
const LARGO_MAXIMO_TITULO = 28;

interface Datos {
  publicaciones: PublicacionesPorUsuario;
  comentariosPorDia: ComentariosPorDia;
  comentariosPorPublicacion: ComentariosPorPublicacion;
}

@Component({
  imports: [FormsModule, Grafico],
  selector: 'app-estadisticas',
  styleUrl: './estadisticas.css',
  templateUrl: './estadisticas.html',
})
export class Estadisticas {
  private readonly estadisticasService = inject(EstadisticasService);

  protected readonly hoy = this.fecha(new Date());
  protected readonly atajos = [7, 30, 90];
  protected readonly desde = signal(this.haceDias(29));
  protected readonly hasta = signal(this.hoy);
  protected readonly atajoActivo = signal<number | null>(30);

  protected readonly datos = signal<Datos | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly errorRango = computed(() =>
    this.desde() > this.hasta() ? 'La fecha "desde" no puede ser posterior a "hasta"' : null,
  );

  protected readonly graficoPublicaciones = computed(() => {
    const datos = this.datos()?.publicaciones.datos ?? [];
    return {
      etiquetas: datos.map((d) => `${d.nombre} ${d.apellido}`),
      valores: datos.map((d) => d.cantidad),
      total: datos.reduce((suma, d) => suma + d.cantidad, 0),
    };
  });

  protected readonly graficoComentariosPorDia = computed(() => {
    const dias = this.datos()?.comentariosPorDia.dias ?? [];
    return {
      etiquetas: dias.map((d) => `${d.fecha.slice(8, 10)}/${d.fecha.slice(5, 7)}`),
      valores: dias.map((d) => d.cantidad),
      total: this.datos()?.comentariosPorDia.total ?? 0,
    };
  });

  protected readonly graficoComentariosPorPublicacion = computed(() => {
    const datos = this.datos()?.comentariosPorPublicacion.datos ?? [];
    return {
      etiquetas: datos.map((d) => this.recortar(d.titulo) + (d.activa ? '' : ' (eliminada)')),
      valores: datos.map((d) => d.cantidad),
      total: datos.reduce((suma, d) => suma + d.cantidad, 0),
    };
  });

  constructor() {
    this.cargar();
  }

  protected usarAtajo(dias: number): void {
    this.atajoActivo.set(dias);
    this.desde.set(this.haceDias(dias - 1));
    this.hasta.set(this.hoy);
    this.cargar();
  }

  protected cambiarFecha(campo: 'desde' | 'hasta', valor: string): void {
    this.atajoActivo.set(null);
    this[campo].set(valor);
  }

  protected cargar(): void {
    if (this.errorRango() || !this.desde() || !this.hasta()) return;

    const rango = { desde: this.desde(), hasta: this.hasta() };
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      publicaciones: this.estadisticasService.publicacionesPorUsuario(rango),
      comentariosPorDia: this.estadisticasService.comentariosPorDia(rango),
      comentariosPorPublicacion: this.estadisticasService.comentariosPorPublicacion(rango),
    }).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajesDeError(err).join(' '));
        this.cargando.set(false);
      },
    });
  }

  private haceDias(dias: number): string {
    return this.fecha(new Date(Date.now() - dias * DIA_MS));
  }

  private fecha(momento: Date): string {
    return momento.toLocaleDateString('en-CA');
  }

  private recortar(texto: string): string {
    return texto.length > LARGO_MAXIMO_TITULO
      ? texto.slice(0, LARGO_MAXIMO_TITULO - 1) + '…'
      : texto;
  }
}
