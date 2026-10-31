import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Avatar } from '../../shared/avatar/avatar';
import { mensajesDeError } from '../../shared/errores';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN_MB = 2;

type Campo = 'nombre' | 'apellido' | 'descripcion';

@Component({
  imports: [Avatar, ReactiveFormsModule, RouterLink],
  selector: 'app-editar-perfil',
  styleUrl: './editar-perfil.css',
  templateUrl: './editar-perfil.html',
})
export class EditarPerfil {
  private readonly usuariosService = inject(UsuariosService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly usuario = inject(AuthService).usuario;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: [this.usuario()?.nombre ?? '', [Validators.required, Validators.maxLength(50)]],
    apellido: [this.usuario()?.apellido ?? '', [Validators.required, Validators.maxLength(50)]],
    descripcion: [this.usuario()?.descripcion ?? '', [Validators.maxLength(200)]],
  });

  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal<string | null>(null);
  protected readonly guardando = signal(false);

  private readonly mensajes: Record<Campo, Record<string, string>> = {
    nombre: { required: 'Ingresá tu nombre', maxlength: 'Máximo 50 caracteres' },
    apellido: { required: 'Ingresá tu apellido', maxlength: 'Máximo 50 caracteres' },
    descripcion: { maxlength: 'Máximo 200 caracteres' },
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarVistaPrevia());
  }

  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (!control.touched || !control.errors) return null;
    return this.mensajes[campo][Object.keys(control.errors)[0]];
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

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, apellido, descripcion } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', nombre.trim());
    datos.append('apellido', apellido.trim());
    datos.append('descripcion', descripcion.trim());
    const imagen = this.imagen();
    if (imagen) datos.append('imagenPerfil', imagen);

    this.guardando.set(true);
    this.usuariosService.editarMiPerfil(datos).subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.modal.mostrar({
          tipo: 'exito',
          titulo: 'Perfil actualizado',
          mensajes: ['Tus cambios se guardaron correctamente.'],
        });
        this.router.navigate(['/mi-perfil']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos guardar los cambios',
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
