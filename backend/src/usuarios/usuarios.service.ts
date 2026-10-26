import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

// Único lugar que habla con la colección de usuarios.
// Auth (y más adelante el panel de admin) lo usan en vez de tocar el modelo directo.
@Injectable()
export class UsuariosService {
  // @InjectModel le pide a Nest el modelo de Mongoose ya conectado
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) {}

  crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    return this.usuarioModel.create(datos);
  }

  /** Busca por correo o username, incluyendo el hash de la contraseña. */
  buscarParaLogin(identificador: string): Promise<UsuarioDocument | null> {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ email: valor }, { username: valor }] })
      .select('+password') // password tiene select: false, acá sí lo necesitamos
      .exec();
  }

  /** Devuelve qué campos ya están en uso, para avisar cuál se repite. */
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
