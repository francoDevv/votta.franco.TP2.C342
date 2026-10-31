import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';

const DURACION_MINIMA_MS = 700;

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
    if (!this.auth.token) {
      this.ir('/login');
      return;
    }

    forkJoin([this.auth.autorizar(), timer(DURACION_MINIMA_MS)]).subscribe({
      next: () => this.ir(this.destino ?? '/publicaciones'),
      error: () => {
        this.auth.logout();
        this.ir('/login');
      },
    });
  }

  private ir(url: string): void {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }

  private destinoSeguro(destino: string | null): string | null {
    return destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : null;
  }
}
