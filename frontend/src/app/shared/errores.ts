import { HttpErrorResponse } from '@angular/common/http';

/** Convierte un error de la API en mensajes listos para mostrar en un modal. */
export function mensajesDeError(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return ['No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.'];
    }
    // Nest manda { message: string | string[] }
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) return mensaje;
    if (typeof mensaje === 'string') return [mensaje];
  }
  return ['Ocurrió un error inesperado. Probá de nuevo.'];
}
