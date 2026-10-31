import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { mensajesDeError } from '../../shared/errores';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN_MB = 2;

type Campo = 'titulo' | 'restaurante' | 'plato' | 'puntaje' | 'mensaje';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-publicar',
  styleUrl: './publicar.css',
  templateUrl: './publicar.html',
})
export class Publicar {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    restaurante: ['', [Validators.required, Validators.maxLength(80)]],
    plato: ['', [Validators.required, Validators.maxLength(80)]],
    puntaje: [0, [Validators.min(1), Validators.max(5)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  protected readonly estrellas = [1, 2, 3, 4, 5];
  protected readonly etiquetasPuntaje = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal<string | null>(null);
  protected readonly enviando = signal(false);

  private readonly mensajes: Record<Campo, Record<string, string>> = {
    titulo: { required: 'Ponele un título a tu reseña', maxlength: 'Máximo 100 caracteres' },
    restaurante: { required: 'Indicá el restaurante', maxlength: 'Máximo 80 caracteres' },
    plato: { required: 'Indicá el plato', maxlength: 'Máximo 80 caracteres' },
    puntaje: { min: 'Elegí un puntaje del 1 al 5', max: 'El puntaje máximo es 5' },
    mensaje: { required: 'Contá qué te pareció el plato', maxlength: 'Máximo 1000 caracteres' },
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarVistaPrevia());
  }

  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (!control.touched || !control.errors) return null;
    return this.mensajes[campo][Object.keys(control.errors)[0]];
  }

  protected elegirPuntaje(valor: number): void {
    this.form.controls.puntaje.setValue(valor);
    this.form.controls.puntaje.markAsTouched();
  }

  protected elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorImagen.set(null);

    if (archivo && !TIPOS_IMAGEN.includes(archivo.type)) {
      this.errorImagen.set('La imagen debe ser JPG, PNG o WEBP');
    } else if (archivo && archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.errorImagen.set(`La imagen no puede superar los ${MAX_IMAGEN_MB} MB`);
    }

    this.liberarVistaPrevia();
    if (!archivo || this.errorImagen()) {
      this.imagen.set(null);
      input.value = '';
      return;
    }
    this.imagen.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  protected quitarImagen(): void {
    this.liberarVistaPrevia();
    this.imagen.set(null);
    this.errorImagen.set(null);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', valores.titulo.trim());
    datos.append('restaurante', valores.restaurante.trim());
    datos.append('plato', valores.plato.trim());
    datos.append('puntaje', String(valores.puntaje));
    datos.append('mensaje', valores.mensaje.trim());
    const imagen = this.imagen();
    if (imagen) datos.append('imagen', imagen);

    this.enviando.set(true);
    this.publicacionesService.crear(datos).subscribe({
      next: async () => {
        this.enviando.set(false);
        await this.modal.mostrar({
          tipo: 'exito',
          titulo: '¡Plato publicado!',
          mensajes: ['Tu reseña ya está visible para toda la comunidad.'],
          textoBoton: 'Ver publicaciones',
        });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos publicar tu plato',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
  }
}
