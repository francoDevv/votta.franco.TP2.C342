import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { Comentario, Pagina, Publicacion } from '../../models/publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentarioItem } from '../../shared/comentario-item/comentario-item';
import { mensajesDeError } from '../../shared/errores';
import { PublicacionCard } from '../../shared/publicacion-card/publicacion-card';

const ULTIMAS_PUBLICACIONES = 3;
const COMENTARIOS_POR_PUBLICACION = 5;

interface PublicacionConComentarios {
  publicacion: Publicacion;
  comentarios: Pagina<Comentario>;
}

@Component({
  imports: [DatePipe, RouterLink, PublicacionCard, ComentarioItem],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil {
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly ultimas = signal<PublicacionConComentarios[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() : '';
  });

  constructor() {
    this.cargarPublicaciones();
  }

  protected cargarPublicaciones(): void {
    const usuario = this.usuario();
    if (!usuario) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.publicacionesService
      .listar({ usuario: usuario._id, limit: ULTIMAS_PUBLICACIONES })
      .pipe(
        switchMap(({ items }) =>
          items.length === 0
            ? of([])
            : forkJoin(
                items.map((publicacion) =>
                  this.publicacionesService
                    .listarComentarios(publicacion._id, 0, COMENTARIOS_POR_PUBLICACION)
                    .pipe(map((comentarios) => ({ publicacion, comentarios }))),
                ),
              ),
        ),
      )
      .subscribe({
        next: (ultimas) => {
          this.ultimas.set(ultimas);
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set(mensajesDeError(err).join(' '));
          this.cargando.set(false);
        },
      });
  }
}
