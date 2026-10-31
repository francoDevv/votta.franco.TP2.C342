import { Injectable, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { mensajesDeError } from '../shared/errores';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

const AVISO_ANTES_DE_VENCER_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;
  private temporizadorVencimiento?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => this.programar(this.auth.tokenSesion()));
  }

  private programar(token: string | null): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorVencimiento);

    const vence = this.auth.vencimiento(token);
    if (!vence) return;

    const restante = vence - Date.now();
    if (restante <= 0) return;

    this.temporizadorAviso = setTimeout(
      () => this.avisar(vence),
      Math.max(0, restante - AVISO_ANTES_DE_VENCER_MS),
    );
    this.temporizadorVencimiento = setTimeout(() => this.vencer(), restante);
  }

  private async avisar(vence: number): Promise<void> {
    const minutos = Math.max(1, Math.round((vence - Date.now()) / 60000));
    const extender = await this.modal.mostrar({
      tipo: 'pregunta',
      titulo: 'Tu sesión está por vencer',
      mensajes: [`Te quedan ${minutos} minutos de sesión. ¿Querés extenderla?`],
      textoBoton: 'Extender sesión',
      textoCancelar: 'Ahora no',
    });
    if (!extender || !this.auth.token) return;

    this.auth.refrescar().subscribe({
      next: () =>
        this.modal.mostrar({
          tipo: 'exito',
          titulo: 'Sesión extendida',
          mensajes: ['Tenés 15 minutos más de sesión.'],
        }),
      error: (err) =>
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos extender tu sesión',
          mensajes: mensajesDeError(err),
        }),
    });
  }

  private vencer(): void {
    if (!this.auth.token) return;
    this.auth.logout();
    this.router.navigate(['/login']);
    this.modal.mostrar({
      tipo: 'info',
      titulo: 'Tu sesión venció',
      mensajes: ['Pasaron 15 minutos desde que iniciaste sesión. Ingresá de nuevo para continuar.'],
    });
  }
}
