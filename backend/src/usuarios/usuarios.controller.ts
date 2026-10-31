import { Controller, Get } from '@nestjs/common';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  miUsuario(@UsuarioActual() usuario: UsuarioToken) {
    return this.usuariosService.buscarPorId(usuario.sub);
  }
}
