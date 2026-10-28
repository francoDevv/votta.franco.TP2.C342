import { HttpErrorResponse } from '@angular/common/http';

export function mensajesDeError(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return ['No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.'];
    }

    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) return mensaje;
    if (typeof mensaje === 'string') return [mensaje];
  }
  return ['Ocurrió un error inesperado. Probá de nuevo.'];
}
