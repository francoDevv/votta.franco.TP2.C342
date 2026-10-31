import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estrellas' })
export class EstrellasPipe implements PipeTransform {
  transform(puntaje: number, maximo = 5): string {
    const llenas = Math.max(0, Math.min(maximo, Math.round(puntaje)));
    return '★'.repeat(llenas) + '☆'.repeat(maximo - llenas);
  }
}
