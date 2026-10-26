import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Sprint 1: muestra los datos del usuario logueado.
// En el sprint 2 se suman sus últimas 3 publicaciones.
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil {
  protected readonly usuario = inject(AuthService).usuario;

  /** Iniciales para el avatar cuando no hay foto (ej: "FV"). */
  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() : '';
  });
}
