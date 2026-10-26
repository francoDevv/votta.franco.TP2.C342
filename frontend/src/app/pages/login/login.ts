import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { mensajesDeError } from '../../shared/errores';
import { passwordSegura } from '../../shared/validadores';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    identificador: ['', [Validators.required]],
    // El TP pide validar las reglas de la contraseña también en el login
    password: ['', [Validators.required, passwordSegura]],
  });

  protected readonly enviando = signal(false);
  protected readonly verPassword = signal(false);

  protected errorIdentificador(): string | null {
    const control = this.form.controls.identificador;
    return control.touched && control.hasError('required') ? 'Ingresá tu usuario o correo' : null;
  }

  protected errorPassword(): string | null {
    const control = this.form.controls.password;
    if (!control.touched || !control.errors) return null;
    if (control.hasError('required')) return 'Ingresá tu contraseña';
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identificador, password } = this.form.getRawValue();

    this.enviando.set(true);
    this.auth.login(identificador.trim(), password).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos iniciar sesión',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }
}
