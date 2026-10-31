import { Request } from 'express';
import { Perfil } from '../../usuarios/schemas/usuario.schema.js';

export interface UsuarioToken {
  sub: string;
  username: string;
  perfil: Perfil;
}

export interface RequestConUsuario extends Request {
  usuario?: UsuarioToken;
}
