import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Publicacion } from './schemas/publicacion.schema.js';

const COLECCION_USUARIOS = 'usuarios';
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const OFFSET_ARGENTINA = '-03:00';
const DIAS_POR_DEFECTO = 30;
const MAXIMO_DIAS = 366;
const MAXIMO_PUBLICACIONES = 10;
const DIA_MS = 24 * 60 * 60 * 1000;

interface Rango {
  inicio: Date;
  fin: Date;
  desde: string;
  hasta: string;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  async publicacionesPorUsuario(filtro: RangoFechasDto) {
    const rango = this.resolverRango(filtro);

    const datos = await this.publicacionModel.aggregate<{
      usuarioId: string;
      nombre: string;
      apellido: string;
      username: string;
      cantidad: number;
    }>([
      { $match: { createdAt: { $gte: rango.inicio, $lte: rango.fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      {
        $lookup: {
          from: COLECCION_USUARIOS,
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          username: '$usuario.username',
          cantidad: 1,
        },
      },
    ]);

    return { desde: rango.desde, hasta: rango.hasta, datos };
  }

  async comentariosPorDia(filtro: RangoFechasDto) {
    const rango = this.resolverRango(filtro);

    const porDia = await this.comentarioModel.aggregate<{ _id: string; cantidad: number }>([
      { $match: { createdAt: { $gte: rango.inicio, $lte: rango.fin } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA_HORARIA },
          },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const cantidades = new Map(porDia.map((d) => [d._id, d.cantidad]));
    const dias = this.diasDelRango(rango).map((fecha) => ({
      fecha,
      cantidad: cantidades.get(fecha) ?? 0,
    }));
    const total = dias.reduce((suma, d) => suma + d.cantidad, 0);

    return { desde: rango.desde, hasta: rango.hasta, total, dias };
  }

  async comentariosPorPublicacion(filtro: RangoFechasDto) {
    const rango = this.resolverRango(filtro);

    const datos = await this.comentarioModel.aggregate<{
      publicacionId: string;
      titulo: string;
      activa: boolean;
      cantidad: number;
    }>([
      { $match: { createdAt: { $gte: rango.inicio, $lte: rango.fin } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: MAXIMO_PUBLICACIONES },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$publicacion.titulo',
          activa: '$publicacion.activo',
          cantidad: 1,
        },
      },
    ]);

    return { desde: rango.desde, hasta: rango.hasta, datos };
  }

  private resolverRango({ desde, hasta }: RangoFechasDto): Rango {
    const hoy = this.fechaArgentina(new Date());
    const hastaFinal = hasta ?? hoy;
    const desdeFinal =
      desde ??
      this.fechaArgentina(
        new Date(this.inicioDelDia(hastaFinal).getTime() - (DIAS_POR_DEFECTO - 1) * DIA_MS),
      );

    const inicio = this.inicioDelDia(desdeFinal);
    const fin = new Date(this.inicioDelDia(hastaFinal).getTime() + DIA_MS - 1);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas no son válidas');
    }
    if (inicio > fin) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    if ((fin.getTime() - inicio.getTime()) / DIA_MS > MAXIMO_DIAS) {
      throw new BadRequestException(`El rango no puede superar los ${MAXIMO_DIAS} días`);
    }

    return { inicio, fin, desde: desdeFinal, hasta: hastaFinal };
  }

  private inicioDelDia(fecha: string): Date {
    return new Date(`${fecha}T00:00:00${OFFSET_ARGENTINA}`);
  }

  private fechaArgentina(momento: Date): string {
    return momento.toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA });
  }

  private diasDelRango({ inicio, fin }: Rango): string[] {
    const dias: string[] = [];
    for (let t = inicio.getTime(); t <= fin.getTime(); t += DIA_MS) {
      dias.push(this.fechaArgentina(new Date(t)));
    }
    return dias;
  }
}
