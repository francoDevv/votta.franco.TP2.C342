import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.usuario()?.perfil === 'administrador'
    ? true
    : inject(Router).createUrlTree(['/publicaciones']);
};
