import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

const RUTAS_SIN_REDIRECCION = ['/auth/login', '/auth/registro', '/auth/autorizar'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const modal = inject(ModalService);

  const token = auth.token;
  const pedido = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(pedido).pipe(
    catchError((error: unknown) => {
      const esRutaExcluida = RUTAS_SIN_REDIRECCION.some((ruta) => req.url.endsWith(ruta));

      if (error instanceof HttpErrorResponse && error.status === 401 && !esRutaExcluida && auth.token) {
        auth.logout();
        router.navigate(['/login']);
        modal.mostrar({
          tipo: 'info',
          titulo: 'Tu sesión venció',
          mensajes: ['Por seguridad cerramos tu sesión. Ingresá de nuevo para continuar.'],
        });
      }
      return throwError(() => error);
    }),
  );
};
