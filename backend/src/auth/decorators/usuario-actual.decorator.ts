import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestConUsuario, UsuarioToken } from '../interfaces/usuario-token.interface.js';

export const UsuarioActual = createParamDecorator(
  (_dato: unknown, context: ExecutionContext): UsuarioToken => {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    return request.usuario!;
  },
);
