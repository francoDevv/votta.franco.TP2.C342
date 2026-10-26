import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensajes: string[];
  textoBoton?: string;
}

/**
 * Reemplazo de alert(): cualquier componente llama a mostrar() y
 * el componente <app-modal> (que vive en app.html) se dibuja solo.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly actual = signal<DatosModal | null>(null);
  private alCerrar: (() => void) | null = null;

  /** Devuelve una promesa que se resuelve cuando el usuario cierra el modal. */
  mostrar(datos: DatosModal): Promise<void> {
    this.actual.set(datos);
    return new Promise((resolve) => (this.alCerrar = resolve));
  }

  cerrar(): void {
    this.actual.set(null);
    this.alCerrar?.();
    this.alCerrar = null;
  }
}
