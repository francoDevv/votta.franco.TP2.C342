import { Injectable, signal } from '@angular/core';

export type TipoModal = 'exito' | 'error' | 'info' | 'pregunta';

export interface DatosModal {
  tipo: TipoModal;
  titulo: string;
  mensajes: string[];
  textoBoton?: string;
  textoCancelar?: string;
  peligro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly actual = signal<DatosModal | null>(null);
  private alCerrar: ((confirmado: boolean) => void) | null = null;

  mostrar(datos: DatosModal): Promise<boolean> {
    this.alCerrar?.(false);
    this.actual.set(datos);
    return new Promise((resolve) => (this.alCerrar = resolve));
  }

  confirmar(titulo: string, mensaje: string, textoBoton = 'Confirmar'): Promise<boolean> {
    return this.mostrar({
      tipo: 'pregunta',
      titulo,
      mensajes: [mensaje],
      textoBoton,
      textoCancelar: 'Cancelar',
      peligro: true,
    });
  }

  cerrar(confirmado = true): void {
    const resolver = this.alCerrar;
    this.alCerrar = null;
    this.actual.set(null);
    resolver?.(confirmado);
  }
}
