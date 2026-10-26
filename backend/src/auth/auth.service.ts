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
  // Nest crea e inyecta estos servicios solo (inyección de dependencias)
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto, imagen?: Express.Multer.File) {
    // 1. Reglas que el DTO no puede chequear solo
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const fechaNacimiento = this.validarFechaNacimiento(dto.fechaNacimiento);

    // 2. Email y username únicos -> 409 Conflict si ya existen
    const enUso = await this.usuariosService.camposEnUso(dto.email, dto.username);
    if (enUso.length > 0) {
      const mensajes = {
        email: 'Ese correo ya está registrado',
        username: 'Ese nombre de usuario ya está en uso',
      };
      throw new ConflictException(enUso.map((campo) => mensajes[campo]));
    }

    // 3. Contraseña encriptada (hash) y foto subida a Cloudinary
    const password = await bcrypt.hash(dto.password, RONDAS_BCRYPT);
    const imagenPerfil = imagen
      ? await this.cloudinaryService.subirImagen(imagen, 'perfiles')
      : null;

    // 4. Guardar. "perfil" no viene del body: todo registro público es "usuario".
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
      // Dos registros iguales al mismo tiempo: el índice unique de Mongo frena al segundo
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están en uso');
      }
      throw error;
    }

    // Queda logueado directamente después de registrarse
    return this.respuestaConToken(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(dto.identificador);

    // Mismo mensaje si no existe o si la contraseña está mal:
    // así no se puede averiguar qué usuarios están registrados.
    // bcrypt.compare hashea la contraseña recibida y la compara con la guardada.
    const credencialesOk = usuario && (await bcrypt.compare(dto.password, usuario.password));
    if (!usuario || !credencialesOk) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Baja lógica (sprint 4): la cuenta existe pero no puede entrar
    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador.');
    }

    return this.respuestaConToken(usuario);
  }

  /** Arma la respuesta de login/registro: datos del usuario + token JWT. */
  private async respuestaConToken(usuario: UsuarioDocument) {
    const payload = {
      sub: usuario.id, // "sub" (subject) es el campo estándar para el id
      username: usuario.username,
      perfil: usuario.perfil,
    };
    return {
      usuario: usuario.toJSON(), // toJSON del schema saca la contraseña
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
