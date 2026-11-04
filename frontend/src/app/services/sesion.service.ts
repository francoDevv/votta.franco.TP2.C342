import { Injectable, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { mensajesDeError } from '../shared/errores';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

const FRACCION_PARA_AVISAR = 2 / 3;

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

    const tiempos = this.auth.tiemposToken(token);
    if (!tiempos) return;

    const ahora = Date.now();
    if (tiempos.vence <= ahora) return;

    const momentoAviso = tiempos.emitido + (tiempos.vence - tiempos.emitido) * FRACCION_PARA_AVISAR;
    this.temporizadorAviso = setTimeout(
      () => this.avisar(tiempos.vence),
      Math.max(0, momentoAviso - ahora),
    );
    this.temporizadorVencimiento = setTimeout(() => this.vencer(), tiempos.vence - ahora);
  }

  private async avisar(vence: number): Promise<void> {
    const restante = this.duracionLegible(vence - Date.now());
    const extender = await this.modal.mostrar({
      tipo: 'pregunta',
      titulo: 'Tu sesión está por vencer',
      mensajes: [`Te quedan ${restante} de sesión. ¿Querés extenderla?`],
      textoBoton: 'Extender sesión',
      textoCancelar: 'Ahora no',
    });
    if (!extender || !this.auth.token) return;

    this.auth.refrescar().subscribe({
      next: () => {
        const tiempos = this.auth.tiemposToken();
        const duracion = tiempos ? this.duracionLegible(tiempos.vence - tiempos.emitido) : '';
        this.modal.mostrar({
          tipo: 'exito',
          titulo: 'Sesión extendida',
          mensajes: [`Tenés ${duracion} más de sesión.`],
        });
      },
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
      mensajes: ['Se terminó el tiempo de tu sesión. Ingresá de nuevo para continuar.'],
    });
  }

  private duracionLegible(ms: number): string {
    const segundos = Math.max(1, Math.round(ms / 1000));
    if (segundos < 120) return `${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`;
    const minutos = Math.round(segundos / 60);
    return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  }
}
