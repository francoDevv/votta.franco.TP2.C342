import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegistroDto } from '../auth/dto/registro.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';
import { Perfil, Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

const EDAD_MINIMA = 13;
const RONDAS_BCRYPT = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registrar(
    dto: RegistroDto,
    imagen?: Express.Multer.File,
    perfil: Perfil = 'usuario',
  ): Promise<UsuarioDocument> {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const fechaNacimiento = this.validarFechaNacimiento(dto.fechaNacimiento);

    const enUso = await this.camposEnUso(dto.email, dto.username);
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

    try {
      return await this.usuarioModel.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        username: dto.username,
        password,
        fechaNacimiento,
        descripcion: dto.descripcion ?? '',
        imagenPerfil,
        perfil,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están en uso');
      }
      throw error;
    }
  }

  listar(): Promise<UsuarioDocument[]> {
    return this.usuarioModel.find().sort({ createdAt: -1 }).exec();
  }

  buscarPorIdOpcional(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).exec();
  }

  async buscarPorId(id: string): Promise<UsuarioDocument> {
    const usuario = await this.buscarPorIdOpcional(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  async cambiarEstado(id: string, activo: boolean, adminId: string): Promise<UsuarioDocument> {
    if (!activo && id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    const usuario = await this.buscarPorId(id);
    usuario.activo = activo;
    return usuario.save();
  }

  async actualizarPerfil(
    id: string,
    dto: EditarPerfilDto,
    imagen?: Express.Multer.File,
  ): Promise<UsuarioDocument> {
    const usuario = await this.buscarPorId(id);

    usuario.nombre = dto.nombre;
    usuario.apellido = dto.apellido;
    usuario.descripcion = dto.descripcion ?? '';
    if (imagen) {
      usuario.imagenPerfil = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
    }

    return usuario.save();
  }

  buscarParaLogin(identificador: string): Promise<UsuarioDocument | null> {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ email: valor }, { username: valor }] })
      .select('+password')
      .exec();
  }

  async camposEnUso(email: string, username: string): Promise<('email' | 'username')[]> {
    const emailNormalizado = email.toLowerCase();
    const usernameNormalizado = username.toLowerCase();

    const existentes = await this.usuarioModel
      .find({ $or: [{ email: emailNormalizado }, { username: usernameNormalizado }] })
      .select('email username')
      .lean();

    const enUso: ('email' | 'username')[] = [];
    if (existentes.some((u) => u.email === emailNormalizado)) enUso.push('email');
    if (existentes.some((u) => u.username === usernameNormalizado)) enUso.push('username');
    return enUso;
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
