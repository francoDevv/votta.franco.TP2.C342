import { Component, input } from '@angular/core';
import { Comentario } from '../../models/publicacion';
import { Avatar } from '../avatar/avatar';
import { TiempoRelativoPipe } from '../pipes/tiempo-relativo.pipe';

@Component({
  selector: 'app-comentario-item',
  imports: [Avatar, TiempoRelativoPipe],
  template: `
    @let c = comentario();
    <app-avatar [usuario]="c.autor" [tamano]="32" />
    <div class="cuerpo">
      <p class="cabecera">
        <strong>{{ c.autor.nombre }} {{ c.autor.apellido }}</strong>
        <small>
          {{ c.createdAt | tiempoRelativo }}
          @if (c.modificado) {
            · <em>editado</em>
          }
        </small>
      </p>
      <p class="mensaje">{{ c.mensaje }}</p>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      gap: 0.6rem;
    }

    .cuerpo {
      flex: 1;
      min-width: 0;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radio-chico);
      background: var(--color-fondo);
    }

    p {
      margin: 0;
    }

    .cabecera {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 0.5rem;
    }

    small {
      color: var(--color-texto-suave);
    }

    .mensaje {
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
  `,
})
export class ComentarioItem {
  readonly comentario = input.required<Comentario>();
}
