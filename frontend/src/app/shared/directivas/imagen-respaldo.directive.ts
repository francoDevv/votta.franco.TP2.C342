import { Directive, ElementRef, inject, input } from '@angular/core';

const RESPALDO_POR_DEFECTO = 'imagen-no-disponible.svg';

@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '(error)': 'usarRespaldo()' },
})
export class ImagenRespaldoDirective {
  readonly appImagenRespaldo = input<string>('');

  private readonly imagen = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  protected usarRespaldo(): void {
    const respaldo = this.appImagenRespaldo() || RESPALDO_POR_DEFECTO;
    if (this.imagen.src.endsWith(respaldo)) return;

    this.imagen.src = respaldo;
    this.imagen.classList.add('imagen-respaldo');
  }
}
