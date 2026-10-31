import { Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const momento = new Date(fecha);
    const segundos = Math.floor((Date.now() - momento.getTime()) / 1000);

    if (segundos < MINUTO) return 'hace un momento';
    if (segundos < HORA) return `hace ${Math.floor(segundos / MINUTO)} min`;
    if (segundos < DIA) return `hace ${Math.floor(segundos / HORA)} h`;
    if (segundos < 7 * DIA) {
      const dias = Math.floor(segundos / DIA);
      return dias === 1 ? 'ayer' : `hace ${dias} días`;
    }
    return momento.toLocaleDateString('es-AR');
  }
}
