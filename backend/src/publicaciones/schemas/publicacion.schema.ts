import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({
  collection: 'publicaciones',
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true, index: true })
  autor!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  titulo!: string;

  @Prop({ required: true, trim: true })
  mensaje!: string;

  @Prop({ type: String, default: null })
  imagenUrl!: string | null;

  @Prop({ required: true, trim: true })
  restaurante!: string;

  @Prop({ required: true, trim: true })
  plato!: string;

  @Prop({ required: true, min: 1, max: 5 })
  puntaje!: number;

  @Prop({ default: 0 })
  likesCount!: number;

  @Prop({ default: 0 })
  comentariosCount!: number;

  @Prop({ default: true })
  activo!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

PublicacionSchema.index({ activo: 1, createdAt: -1 });
PublicacionSchema.index({ activo: 1, likesCount: -1, createdAt: -1 });
