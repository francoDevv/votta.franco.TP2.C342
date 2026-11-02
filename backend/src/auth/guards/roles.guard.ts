import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '../../usuarios/schemas/usuario.schema.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { ROLES } from '../decorators/roles.decorator.js';
import { RequestConUsuario } from '../interfaces/usuario-token.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const perfiles = this.reflector.getAllAndOverride<Perfil[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!perfiles?.length) return true;

    const { usuario } = context.switchToHttp().getRequest<RequestConUsuario>();
    if (!usuario) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    const actual = await this.usuariosService.buscarPorIdOpcional(usuario.sub);
    if (!actual || !actual.activo) {
      throw new UnauthorizedException('Tu sesión ya no es válida');
    }
    if (!perfiles.includes(actual.perfil)) {
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }
    return true;
  }
}
