import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ES_PUBLICO } from '../decorators/publico.decorator.js';
import { RequestConUsuario, UsuarioToken } from '../interfaces/usuario-token.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = this.extraerToken(request);
    if (!token) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    try {
      request.usuario = await this.jwtService.verifyAsync<UsuarioToken>(token);
    } catch {
      throw new UnauthorizedException('Tu sesión venció o no es válida');
    }
    return true;
  }

  private extraerToken(request: RequestConUsuario): string | null {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : null;
  }
}
