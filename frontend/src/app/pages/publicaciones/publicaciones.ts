import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdenPublicaciones, Pagina, Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { mensajesDeError } from '../../shared/errores';
import { PluralizarPipe } from '../../shared/pipes/pluralizar.pipe';
import { PublicacionCard } from '../../shared/publicacion-card/publicacion-card';

const POR_PAGINA = 5;

@Component({
  imports: [PluralizarPipe, RouterLink, PublicacionCard],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones {
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly orden = signal<OrdenPublicaciones>('fecha');
  protected readonly pagina = signal(1);
  protected readonly resultado = signal<Pagina<Publicacion> | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil((this.resultado()?.total ?? 0) / POR_PAGINA)),
  );
  protected readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );

  constructor() {
    this.cargar();
  }

  protected cambiarOrden(orden: OrdenPublicaciones): void {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargar();
  }

  protected irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina()) return;
    this.pagina.set(pagina);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected alEliminar(): void {
    const quedabaUna = this.resultado()?.items.length === 1;
    if (quedabaUna && this.pagina() > 1) this.pagina.update((p) => p - 1);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.publicacionesService
      .listar({
        orden: this.orden(),
        offset: (this.pagina() - 1) * POR_PAGINA,
        limit: POR_PAGINA,
      })
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set(mensajesDeError(err).join(' '));
          this.cargando.set(false);
        },
      });
  }
}
