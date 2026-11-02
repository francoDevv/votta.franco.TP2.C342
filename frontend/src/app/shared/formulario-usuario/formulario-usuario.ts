import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Perfil } from '../../models/usuario';
import { coinciden, edadMinima, passwordSegura } from '../validadores';

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
  selector: 'app-formulario-usuario',
  imports: [ReactiveFormsModule],
  styleUrl: './formulario-usuario.css',
  templateUrl: './formulario-usuario.html',
})
export class FormularioUsuario {
  readonly modoAdmin = input(false);
  readonly enviando = input(false);
  readonly textoBoton = input('Crear cuenta');
  readonly textoEnviando = input('Creando cuenta...');
  readonly enviar = output<FormData>();

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
      perfil: ['usuario' as Perfil],
    },
    { validators: coinciden('password', 'repetirPassword') },
  );

  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal<string | null>(null);
  protected readonly hoy = new Date().toISOString().slice(0, 10);

  private readonly mensajes: Record<Campo, Record<string, string>> = {
    nombre: { required: 'Ingresá el nombre', maxlength: 'Máximo 50 caracteres' },
    apellido: { required: 'Ingresá el apellido', maxlength: 'Máximo 50 caracteres' },
    email: { required: 'Ingresá el correo', pattern: 'El correo no es válido' },
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
      required: 'Ingresá la fecha de nacimiento',
      fechaFutura: 'La fecha no puede ser futura',
      edadMinima: 'Tiene que tener al menos 13 años',
    },
    descripcion: { maxlength: 'Máximo 200 caracteres' },
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarVistaPrevia());
  }

  reiniciar(): void {
    this.form.reset();
    this.quitarImagen();
  }

  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (!control.touched) return null;

    const errores = { ...control.errors };
    if (campo === 'repetirPassword' && this.form.hasError('noCoinciden')) {
      errores['noCoinciden'] = true;
    }
    const claves = Object.keys(errores);
    if (claves.length === 0) return null;

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

  protected enviarFormulario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { perfil, ...campos } = this.form.getRawValue();
    const datos = new FormData();
    for (const [campo, valor] of Object.entries(campos)) {
      if (valor.trim()) datos.append(campo, valor.trim());
    }
    if (this.modoAdmin()) datos.append('perfil', perfil);
    const imagen = this.imagen();
    if (imagen) datos.append('imagenPerfil', imagen);

    this.enviar.emit(datos);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
  }
}
