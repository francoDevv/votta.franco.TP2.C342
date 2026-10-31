import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoMeGusta, Publicacion } from '../../models/publicacion';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Avatar } from '../avatar/avatar';
import { mensajesDeError } from '../errores';
import { EstrellasPipe } from '../pipes/estrellas.pipe';
import { TiempoRelativoPipe } from '../pipes/tiempo-relativo.pipe';

@Component({
  selector: 'app-publicacion-card',
  imports: [Avatar, EstrellasPipe, RouterLink, TiempoRelativoPipe],
  styleUrl: './publicacion-card.css',
  templateUrl: './publicacion-card.html',
  host: { '[class.destacada]': 'destacada()' },
})
export class PublicacionCard {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly publicacionesService = inject(PublicacionesService);

  readonly publicacion = input.required<Publicacion>();
  readonly destacada = input(false);
  readonly eliminada = output<string>();
  readonly meGustaCambiado = output<EstadoMeGusta>();

  protected readonly meGusta = linkedSignal(() => this.publicacion().meGusta);
  protected readonly likesCount = linkedSignal(() => this.publicacion().likesCount);
  protected readonly procesando = signal(false);

  protected readonly puedeEliminar = computed(() => {
    const usuario = this.auth.usuario();
    if (!usuario) return false;
    return usuario._id === this.publicacion().autor._id || usuario.perfil === 'administrador';
  });

  protected alternarMeGusta(): void {
    if (this.procesando()) return;

    const anterior = { meGusta: this.meGusta(), likesCount: this.likesCount() };
    this.meGusta.set(!anterior.meGusta);
    this.likesCount.set(anterior.likesCount + (anterior.meGusta ? -1 : 1));
    this.procesando.set(true);

    const id = this.publicacion()._id;
    const pedido = anterior.meGusta
      ? this.publicacionesService.quitarMeGusta(id)
      : this.publicacionesService.darMeGusta(id);

    pedido.subscribe({
      next: (estado) => {
        this.meGusta.set(estado.meGusta);
        this.likesCount.set(estado.likesCount);
        this.procesando.set(false);
        this.meGustaCambiado.emit(estado);
      },
      error: (err) => {
        this.meGusta.set(anterior.meGusta);
        this.likesCount.set(anterior.likesCount);
        this.procesando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos actualizar el me gusta',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }

  protected async eliminar(): Promise<void> {
    const confirmado = await this.modal.confirmar(
      '¿Eliminar publicación?',
      `"${this.publicacion().titulo}" y sus comentarios dejarán de estar disponibles.`,
      'Eliminar',
    );
    if (!confirmado) return;

    this.procesando.set(true);
    this.publicacionesService.eliminar(this.publicacion()._id).subscribe({
      next: () => {
        this.eliminada.emit(this.publicacion()._id);
        this.modal.mostrar({
          tipo: 'exito',
          titulo: 'Publicación eliminada',
          mensajes: ['La publicación se eliminó correctamente.'],
        });
      },
      error: (err) => {
        this.procesando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos eliminar la publicación',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }
}
