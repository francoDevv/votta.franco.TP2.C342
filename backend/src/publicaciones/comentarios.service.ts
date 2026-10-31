import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginacionDto } from '../common/dto/paginacion.dto.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { PublicacionesService } from './publicaciones.service.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Publicacion } from './schemas/publicacion.schema.js';

const CAMPOS_AUTOR = 'nombre apellido username imagenPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  async listar(publicacionId: string, { offset, limit }: PaginacionDto) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const filtro = { publicacion: new Types.ObjectId(publicacionId) };
    const [items, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autor', CAMPOS_AUTOR)
        .select('-__v')
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { items, total, offset, limit };
  }

  async crear(publicacionId: string, dto: ComentarioDto, autorId: string) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
      mensaje: dto.mensaje,
    });
    await this.publicacionModel.updateOne(
      { _id: publicacionId },
      { $inc: { comentariosCount: 1 } },
    );

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toJSON();
  }

  async editar(publicacionId: string, comentarioId: string, dto: ComentarioDto, autorId: string) {
    await this.publicacionesService.buscarActiva(publicacionId);

    const comentario = await this.comentarioModel.findOne({
      _id: comentarioId,
      publicacion: new Types.ObjectId(publicacionId),
    });
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }
    if (comentario.autor.toString() !== autorId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toJSON();
  }
}
