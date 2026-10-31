import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';
import { Publicacion } from './publicacion.schema.js';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({
  collection: 'comentarios',
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true })
  publicacion!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mensaje!: string;

  @Prop({ default: false })
  modificado!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

ComentarioSchema.index({ publicacion: 1, createdAt: -1, _id: -1 });
ComentarioSchema.index({ createdAt: 1 });
