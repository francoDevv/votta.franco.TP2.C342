import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comentario } from '../../models/publicacion';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Avatar } from '../avatar/avatar';
import { AutofocoDirective } from '../directivas/autofoco.directive';
import { mensajesDeError } from '../errores';
import { TiempoRelativoPipe } from '../pipes/tiempo-relativo.pipe';

export const MAX_COMENTARIO = 500;

@Component({
  selector: 'app-comentario-item',
  imports: [AutofocoDirective, Avatar, FormsModule, TiempoRelativoPipe],
  styleUrl: './comentario-item.css',
  templateUrl: './comentario-item.html',
})
export class ComentarioItem {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly publicacionesService = inject(PublicacionesService);

  readonly comentario = input.required<Comentario>();
  readonly editable = input(false);
  readonly editado = output<Comentario>();

  protected readonly maximo = MAX_COMENTARIO;
  protected readonly editando = signal(false);
  protected readonly texto = signal('');
  protected readonly guardando = signal(false);

  protected readonly esMio = computed(
    () => this.auth.usuario()?._id === this.comentario().autor._id,
  );
  protected readonly errorTexto = computed(() => {
    const valor = this.texto().trim();
    if (!valor) return 'El comentario no puede estar vacío';
    if (valor.length > MAX_COMENTARIO) return `Máximo ${MAX_COMENTARIO} caracteres`;
    return null;
  });

  protected empezarEdicion(): void {
    this.texto.set(this.comentario().mensaje);
    this.editando.set(true);
  }

  protected cancelar(): void {
    this.editando.set(false);
  }

  protected guardar(): void {
    if (this.errorTexto() || this.guardando()) return;

    const mensaje = this.texto().trim();
    if (mensaje === this.comentario().mensaje) {
      this.editando.set(false);
      return;
    }

    const { _id, publicacion } = this.comentario();
    this.guardando.set(true);
    this.publicacionesService.editarComentario(publicacion, _id, mensaje).subscribe({
      next: (actualizado) => {
        this.guardando.set(false);
        this.editando.set(false);
        this.editado.emit(actualizado);
      },
      error: (err) => {
        this.guardando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos editar el comentario',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }
}
