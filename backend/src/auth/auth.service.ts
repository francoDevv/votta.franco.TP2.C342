import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';
import { UsuarioToken } from './interfaces/usuario-token.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(dto, imagen);
    return this.respuestaConToken(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(dto.identificador);

    const credencialesOk = usuario && (await bcrypt.compare(dto.password, usuario.password));
    if (!usuario || !credencialesOk) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador.');
    }

    return this.respuestaConToken(usuario);
  }

  async autorizar(usuarioToken: UsuarioToken) {
    const usuario = await this.usuarioVigente(usuarioToken.sub);
    return usuario.toJSON();
  }

  async refrescar(usuarioToken: UsuarioToken) {
    await this.usuarioVigente(usuarioToken.sub);
    const { sub, username, perfil } = usuarioToken;
    return { token: await this.firmar({ sub, username, perfil }) };
  }

  private async usuarioVigente(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuariosService.buscarPorIdOpcional(id);
    if (!usuario) {
      throw new UnauthorizedException('Tu sesión ya no es válida');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada. Contactá a un administrador.');
    }
    return usuario;
  }

  private async respuestaConToken(usuario: UsuarioDocument) {
    return {
      usuario: usuario.toJSON(),
      token: await this.firmar({
        sub: usuario.id,
        username: usuario.username,
        perfil: usuario.perfil,
      }),
    };
  }

  private firmar(payload: UsuarioToken): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
