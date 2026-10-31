import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Comentario, EstadoMeGusta, Publicacion } from '../../models/publicacion';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentarioItem, MAX_COMENTARIO } from '../../shared/comentario-item/comentario-item';
import { mensajesDeError } from '../../shared/errores';
import { PublicacionCard } from '../../shared/publicacion-card/publicacion-card';

const COMENTARIOS_POR_CARGA = 5;

@Component({
  imports: [ComentarioItem, FormsModule, PublicacionCard, RouterLink],
  selector: 'app-publicacion-detalle',
  styleUrl: './publicacion-detalle.css',
  templateUrl: './publicacion-detalle.html',
})
export class PublicacionDetalle {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly publicacion = signal<Publicacion | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly totalComentarios = signal(0);
  protected readonly cargandoMas = signal(false);
  protected readonly hayMas = computed(() => this.comentarios().length < this.totalComentarios());

  protected readonly maximo = MAX_COMENTARIO;
  protected readonly nuevoComentario = signal('');
  protected readonly enviando = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorComentario = computed(() => {
    const valor = this.nuevoComentario().trim();
    if (!valor) return 'Escribí un comentario';
    if (valor.length > MAX_COMENTARIO) return `Máximo ${MAX_COMENTARIO} caracteres`;
    return null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.cargar(id));
    });
  }

  protected cargar(id = this.id()): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin([
      this.publicacionesService.obtener(id),
      this.publicacionesService.listarComentarios(id, 0, COMENTARIOS_POR_CARGA),
    ]).subscribe({
      next: ([publicacion, comentarios]) => {
        this.publicacion.set(publicacion);
        this.comentarios.set(comentarios.items);
        this.totalComentarios.set(comentarios.total);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err.status === 404
            ? 'Esta publicación no existe o fue eliminada.'
            : mensajesDeError(err).join(' '),
        );
        this.cargando.set(false);
      },
    });
  }

  protected cargarMas(): void {
    if (this.cargandoMas()) return;
    this.cargandoMas.set(true);

    this.publicacionesService
      .listarComentarios(this.id(), this.comentarios().length, COMENTARIOS_POR_CARGA)
      .subscribe({
        next: ({ items, total }) => {
          const existentes = new Set(this.comentarios().map((c) => c._id));
          this.comentarios.update((lista) => [
            ...lista,
            ...items.filter((c) => !existentes.has(c._id)),
          ]);
          this.totalComentarios.set(total);
          this.cargandoMas.set(false);
        },
        error: (err) => {
          this.cargandoMas.set(false);
          this.modal.mostrar({
            tipo: 'error',
            titulo: 'No pudimos cargar más comentarios',
            mensajes: mensajesDeError(err),
          });
        },
      });
  }

  protected comentar(): void {
    this.intentoEnviar.set(true);
    if (this.errorComentario() || this.enviando()) return;

    this.enviando.set(true);
    this.publicacionesService.comentar(this.id(), this.nuevoComentario().trim()).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.totalComentarios.update((total) => total + 1);
        this.publicacion.update((p) => (p ? { ...p, comentariosCount: p.comentariosCount + 1 } : p));
        this.nuevoComentario.set('');
        this.intentoEnviar.set(false);
        this.enviando.set(false);
      },
      error: (err) => {
        this.enviando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos publicar tu comentario',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }

  protected alEditar(actualizado: Comentario): void {
    this.comentarios.update((lista) =>
      lista.map((c) => (c._id === actualizado._id ? actualizado : c)),
    );
  }

  protected alCambiarMeGusta(estado: EstadoMeGusta): void {
    this.publicacion.update((p) => (p ? { ...p, ...estado } : p));
  }

  protected alEliminar(): void {
    this.router.navigate(['/publicaciones']);
  }
}
