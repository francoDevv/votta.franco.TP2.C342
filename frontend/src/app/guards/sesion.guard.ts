import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sesionGuard: CanActivateFn = (_route, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.appIniciada() || (auth.token && !auth.sesionVerificada())) {
    return router.createUrlTree(['/'], { queryParams: { destino: estado.url } });
  }
  if (!auth.token) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

export const invitadoGuard: CanActivateFn = (_route, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.appIniciada()) {
    return router.createUrlTree(['/'], { queryParams: { destino: estado.url } });
  }
  return auth.sesionVerificada() ? router.createUrlTree(['/publicaciones']) : true;
};
