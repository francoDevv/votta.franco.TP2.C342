import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';

const EDAD_MINIMA = 13;
const RONDAS_BCRYPT = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto, imagen?: Express.Multer.File) {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const fechaNacimiento = this.validarFechaNacimiento(dto.fechaNacimiento);

    const enUso = await this.usuariosService.camposEnUso(dto.email, dto.username);
    if (enUso.length > 0) {
      const mensajes = {
        email: 'Ese correo ya está registrado',
        username: 'Ese nombre de usuario ya está en uso',
      };
      throw new ConflictException(enUso.map((campo) => mensajes[campo]));
    }

    const password = await bcrypt.hash(dto.password, RONDAS_BCRYPT);
    const imagenPerfil = imagen
      ? await this.cloudinaryService.subirImagen(imagen, 'perfiles')
      : null;

    let usuario: UsuarioDocument;
    try {
      usuario = await this.usuariosService.crear({
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        username: dto.username,
        password,
        fechaNacimiento,
        descripcion: dto.descripcion ?? '',
        imagenPerfil,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están en uso');
      }
      throw error;
    }

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

  private async respuestaConToken(usuario: UsuarioDocument) {
    const payload = {
      sub: usuario.id, 
      username: usuario.username,
      perfil: usuario.perfil,
    };
    return {
      usuario: usuario.toJSON(), 
      token: await this.jwtService.signAsync(payload),
    };
  }

  private validarFechaNacimiento(valor: string): Date {
    const fecha = new Date(valor);
    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - EDAD_MINIMA);

    if (fecha > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura');
    }
    if (fecha > limite) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años`);
    }
    return fecha;
  }
}
