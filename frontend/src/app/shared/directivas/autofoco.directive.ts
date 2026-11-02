import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({ selector: '[appAutofoco]' })
export class AutofocoDirective {
  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    afterNextRender(() => {
      elemento.focus();
      if (elemento instanceof HTMLTextAreaElement || elemento instanceof HTMLInputElement) {
        const final = elemento.value.length;
        elemento.setSelectionRange(final, final);
      }
    });
  }
}
