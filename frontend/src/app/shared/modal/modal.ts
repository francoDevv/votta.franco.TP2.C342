import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
  host: { '(document:keydown.escape)': 'modal.actual() && modal.cerrar()' },
})
export class Modal {
  protected readonly modal = inject(ModalService);
  private readonly boton = viewChild<ElementRef<HTMLButtonElement>>('boton');

  protected readonly iconos = { exito: '✓', error: '!', info: 'i' };
  protected readonly titulosPorDefecto = { exito: 'Listo', error: 'Revisá esto', info: 'Aviso' };

  constructor() {
    // Al abrirse, el foco va al botón: se puede cerrar con Enter o Escape
    effect(() => this.boton()?.nativeElement.focus());
  }
}
