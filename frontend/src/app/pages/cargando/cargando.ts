import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of, timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';

const DURACION_MINIMA_MS = 900;
const RUTAS_DE_INVITADO = /^\/(login|registro)(\/|\?|$)/;

@Component({
  selector: 'app-cargando',
  styleUrl: './cargando.css',
  templateUrl: './cargando.html',
})
export class Cargando {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destino = this.destinoSeguro(
    inject(ActivatedRoute).snapshot.queryParamMap.get('destino'),
  );

  constructor() {
    this.verificarSesion();
  }

  private verificarSesion(): void {
    const sesionValida = this.auth.token
      ? this.auth.autorizar().pipe(
          map(() => true),
          catchError(() => {
            this.auth.logout();
            return of(false);
          }),
        )
      : of(false);

    forkJoin([sesionValida, timer(DURACION_MINIMA_MS)]).subscribe(([valida]) => {
      this.auth.appIniciada.set(true);
      this.ir(valida ? this.destinoConSesion() : this.destinoSinSesion());
    });
  }

  private destinoConSesion(): string {
    return this.destino && !RUTAS_DE_INVITADO.test(this.destino) ? this.destino : '/publicaciones';
  }

  private destinoSinSesion(): string {
    return this.destino && RUTAS_DE_INVITADO.test(this.destino) ? this.destino : '/login';
  }

  private ir(url: string): void {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }

  private destinoSeguro(destino: string | null): string | null {
    return destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : null;
  }
}
