import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { Avatar } from '../../../shared/avatar/avatar';
import { mensajesDeError } from '../../../shared/errores';
import { FormularioUsuario } from '../../../shared/formulario-usuario/formulario-usuario';
import { PluralizarPipe } from '../../../shared/pipes/pluralizar.pipe';

@Component({
  imports: [Avatar, DatePipe, FormsModule, FormularioUsuario, PluralizarPipe],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly usuariosService = inject(UsuariosService);
  private readonly modal = inject(ModalService);
  private readonly formulario = viewChild(FormularioUsuario);

  protected readonly yo = inject(AuthService).usuario;
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly mostrarFormulario = signal(false);
  protected readonly creando = signal(false);
  protected readonly procesandoId = signal<string | null>(null);

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.usuarios();
    return this.usuarios().filter((u) =>
      [u.nombre, u.apellido, u.username, u.email].some((campo) =>
        campo.toLowerCase().includes(texto),
      ),
    );
  });
  protected readonly resumen = computed(() => {
    const lista = this.usuarios();
    return {
      total: lista.length,
      admins: lista.filter((u) => u.perfil === 'administrador').length,
      deshabilitados: lista.filter((u) => !u.activo).length,
    };
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajesDeError(err).join(' '));
        this.cargando.set(false);
      },
    });
  }

  protected crear(datos: FormData): void {
    this.creando.set(true);
    this.usuariosService.crear(datos).subscribe({
      next: (usuario) => {
        this.creando.set(false);
        this.usuarios.update((lista) => [usuario, ...lista]);
        this.formulario()?.reiniciar();
        this.mostrarFormulario.set(false);
        this.modal.mostrar({
          tipo: 'exito',
          titulo: 'Usuario creado',
          mensajes: [
            `${usuario.nombre} ${usuario.apellido} (@${usuario.username}) ya puede ingresar como ${
              usuario.perfil === 'administrador' ? 'administrador' : 'usuario'
            }.`,
          ],
        });
      },
      error: (err) => {
        this.creando.set(false);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos crear el usuario',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }

  protected async cambiarEstado(usuario: Usuario): Promise<void> {
    const deshabilitar = usuario.activo;
    if (deshabilitar) {
      const confirmado = await this.modal.confirmar(
        `¿Deshabilitar a ${usuario.nombre}?`,
        `@${usuario.username} no va a poder ingresar a Platito hasta que lo vuelvas a habilitar.`,
        'Deshabilitar',
      );
      if (!confirmado) return;
    }

    this.procesandoId.set(usuario._id);
    const pedido = deshabilitar
      ? this.usuariosService.deshabilitar(usuario._id)
      : this.usuariosService.habilitar(usuario._id);

    pedido.subscribe({
      next: (actualizado) => {
        this.procesandoId.set(null);
        this.usuarios.update((lista) =>
          lista.map((u) => (u._id === actualizado._id ? actualizado : u)),
        );
        this.modal.mostrar({
          tipo: 'exito',
          titulo: deshabilitar ? 'Usuario deshabilitado' : 'Usuario habilitado',
          mensajes: [
            deshabilitar
              ? `@${actualizado.username} ya no puede ingresar a la aplicación.`
              : `@${actualizado.username} puede volver a ingresar a la aplicación.`,
          ],
        });
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.modal.mostrar({
          tipo: 'error',
          titulo: 'No pudimos cambiar el estado del usuario',
          mensajes: mensajesDeError(err),
        });
      },
    });
  }
}
