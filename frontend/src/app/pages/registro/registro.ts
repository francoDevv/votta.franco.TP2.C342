import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { mensajesDeError } from '../../shared/errores';
import { coinciden, edadMinima, passwordSegura } from '../../shared/validadores';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN_MB = 2;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Campo =
  | 'nombre'
  | 'apellido'
  | 'email'
  | 'username'
  | 'password'
  | 'repetirPassword'
  | 'fechaNacimiento'
  | 'descripcion';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  // Formulario reactivo: cada campo con sus validaciones
  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.pattern(PATRON_EMAIL)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.]{3,20}$/)]],
      password: ['', [Validators.required, passwordSegura]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
      descripcion: ['', [Validators.maxLength(200)]],
    },
    { validators: coinciden('password', 'repetirPassword') },
  );

  // La foto va aparte: los input file no se llevan bien con los formularios reactivos
  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal<string | null>(null);

  protected readonly enviando = signal(false);
  protected readonly hoy = new Date().toISOString().slice(0, 10);

  private readonly mensajes: Record<Campo, Record<string, string>> = {
    nombre: { required: 'Ingresá tu nombre', maxlength: 'Máximo 50 caracteres' },
    apellido: { required: 'Ingresá tu apellido', maxlength: 'Máximo 50 caracteres' },
    email: { required: 'Ingresá tu correo', pattern: 'El correo no es válido' },
    username: {
      required: 'Elegí un nombre de usuario',
      pattern: 'De 3 a 20 caracteres: letras, números, "_" o "."',
    },
    password: {
      required: 'Ingresá una contraseña',
      minimo8: 'al menos 8 caracteres',
      mayuscula: 'una mayúscula',
      numero: 'un número',
    },
    repetirPassword: {
      required: 'Repetí la contraseña',
      noCoinciden: 'Las contraseñas no coinciden',
    },
    fechaNacimiento: {
      required: 'Ingresá tu fecha de nacimiento',
      fechaFutura: 'La fecha no puede ser futura',
      edadMinima: 'Tenés que tener al menos 13 años',
    },
    descripcion: { maxlength: 'Máximo 200 caracteres' },
  };

  constructor() {
    // Libera la URL de la vista previa al salir de la pantalla
    inject(DestroyRef).onDestroy(() => this.liberarVistaPrevia());
  }

  /** Mensaje de error de un campo, solo si el usuario ya lo tocó. */
  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (!control.touched) return null;

    const errores = { ...control.errors };
    if (campo === 'repetirPassword' && this.form.hasError('noCoinciden')) {
      errores['noCoinciden'] = true;
    }
    const claves = Object.keys(errores);
    if (claves.length === 0) return null;

    // Para la contraseña se listan todas las reglas que faltan
    if (campo === 'password' && !errores['required']) {
      return 'Le falta: ' + claves.map((c) => this.mensajes.password[c]).join(', ');
    }
    return this.mensajes[campo][claves[0]];
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
      this.form.markAllAsTouched(); // muestra todos los errores juntos
      return;
    }

    // multipart/form-data: datos + archivo en una sola request
    const datos = new FormData();
    for (const [campo, valor] of Object.entries(this.form.getRawValue())) {
      if (valor.trim()) datos.append(campo, valor.trim());
    }
    const imagen = this.imagen();
    if (imagen) datos.append('imagenPerfil', imagen);

    this.enviando.set(true);
    this.auth.registrar(datos).subscribe({
      next: async ({ usuario }) => {
        this.enviando.set(false);
        await this.modal.mostrar({
          tipo: 'exito',
          titulo: `¡Hola, ${usuario.nombre}!`,
          mensajes: ['Tu cuenta se creó correctamente. Ya sos parte de Platito.'],
          textoBoton: 'Empezar',
        });
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos crear tu cuenta',
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
