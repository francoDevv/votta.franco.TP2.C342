import { Component, computed, input } from '@angular/core';
import { ImagenRespaldoDirective } from '../directivas/imagen-respaldo.directive';

export interface DatosAvatar {
  nombre: string;
  apellido: string;
  imagenPerfil: string | null;
}

@Component({
  selector: 'app-avatar',
  imports: [ImagenRespaldoDirective],
  template: `
    @if (usuario().imagenPerfil; as url) {
      <img [src]="url" [alt]="'Foto de ' + usuario().nombre" appImagenRespaldo="favicon.svg" />
    } @else {
      <span aria-hidden="true">{{ iniciales() }}</span>
    }
  `,
  styles: `
    :host {
      flex-shrink: 0;
      width: var(--tamano);
      height: var(--tamano);
      border-radius: 50%;
      overflow: hidden;
      display: inline-grid;
      place-items: center;
      font-size: calc(var(--tamano) * 0.4);
      font-weight: 800;
      color: var(--color-primario-hover);
      background: var(--color-primario-suave);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  host: { '[style.--tamano.px]': 'tamano()' },
})
export class Avatar {
  readonly usuario = input.required<DatosAvatar>();
  readonly tamano = input(40);

  protected readonly iniciales = computed(() => {
    const { nombre, apellido } = this.usuario();
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
  });
}
