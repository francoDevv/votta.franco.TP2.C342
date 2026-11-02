import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { mensajesDeError } from '../../shared/errores';
import { FormularioUsuario } from '../../shared/formulario-usuario/formulario-usuario';

@Component({
  imports: [FormularioUsuario, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);

  protected registrar(datos: FormData): void {
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
}
