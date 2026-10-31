import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    return this.usuarioModel.create(datos);
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
}
