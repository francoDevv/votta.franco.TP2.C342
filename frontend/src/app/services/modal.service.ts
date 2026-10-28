import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensajes: string[];
  textoBoton?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly actual = signal<DatosModal | null>(null);
  private alCerrar: (() => void) | null = null;

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
