import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { MeGusta } from './schemas/me-gusta.schema.js';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';

const CAMPOS_AUTOR = 'nombre apellido username imagenPerfil';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(MeGusta.name) private readonly meGustaModel: Model<MeGusta>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async crear(dto: CrearPublicacionDto, autorId: string, imagen?: Express.Multer.File) {
    const imagenUrl = imagen
      ? await this.cloudinaryService.subirImagen(imagen, 'publicaciones')
      : null;

    const publicacion = await this.publicacionModel.create({
      autor: new Types.ObjectId(autorId),
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      restaurante: dto.restaurante,
      plato: dto.plato,
      puntaje: dto.puntaje,
      imagenUrl,
    });
    await publicacion.populate('autor', CAMPOS_AUTOR);
    return Object.assign(publicacion.toJSON(), { meGusta: false });
  }

  async listar(filtros: ListarPublicacionesDto, usuarioId: string) {
    const filtro: { activo: boolean; autor?: Types.ObjectId } = { activo: true };
    if (filtros.usuario) filtro.autor = new Types.ObjectId(filtros.usuario);

    const orden: Record<string, 1 | -1> =
      filtros.orden === 'likes'
        ? { likesCount: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden)
        .skip(filtros.offset)
        .limit(filtros.limit)
        .populate('autor', CAMPOS_AUTOR)
        .select('-__v')
        .lean(),
      this.publicacionModel.countDocuments(filtro),
    ]);

    const misMeGusta = await this.meGustaModel
      .find({
        usuario: new Types.ObjectId(usuarioId),
        publicacion: { $in: publicaciones.map((p) => p._id) },
      })
      .select('publicacion')
      .lean();
    const conMeGusta = new Set(misMeGusta.map((m) => m.publicacion.toString()));

    return {
      items: publicaciones.map((p) =>
        Object.assign(p, { meGusta: conMeGusta.has(p._id.toString()) }),
      ),
      total,
      offset: filtros.offset,
      limit: filtros.limit,
    };
  }

  async obtener(id: string, usuarioId: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('autor', CAMPOS_AUTOR)
      .select('-__v')
      .lean();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }

    const meGusta = await this.meGustaModel.exists({
      usuario: new Types.ObjectId(usuarioId),
      publicacion: publicacion._id,
    });
    return Object.assign(publicacion, { meGusta: meGusta !== null });
  }

  async eliminar(id: string, usuario: UsuarioToken): Promise<void> {
    const publicacion = await this.buscarActiva(id);

    const esAutor = publicacion.autor.toString() === usuario.sub;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo el autor o un administrador pueden eliminar esta publicación');
    }

    publicacion.activo = false;
    await publicacion.save();
  }

  async darMeGusta(id: string, usuarioId: string) {
    await this.buscarActiva(id);

    try {
      await this.meGustaModel.create({
        usuario: new Types.ObjectId(usuarioId),
        publicacion: new Types.ObjectId(id),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Ya le diste me gusta a esta publicación');
      }
      throw error;
    }

    return this.actualizarContador(id, 1, true);
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    await this.buscarActiva(id);

    const borrado = await this.meGustaModel.findOneAndDelete({
      usuario: new Types.ObjectId(usuarioId),
      publicacion: new Types.ObjectId(id),
    });
    if (!borrado) {
      throw new NotFoundException('No le habías dado me gusta a esta publicación');
    }

    return this.actualizarContador(id, -1, false);
  }

  async buscarActiva(id: string): Promise<PublicacionDocument> {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activo: true });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }
    return publicacion;
  }

  private async actualizarContador(id: string, cambio: 1 | -1, meGusta: boolean) {
    const publicacion = await this.publicacionModel
      .findByIdAndUpdate(id, { $inc: { likesCount: cambio } }, { returnDocument: 'after' })
      .select('likesCount')
      .lean();
    return { likesCount: publicacion?.likesCount ?? 0, meGusta };
  }
}
