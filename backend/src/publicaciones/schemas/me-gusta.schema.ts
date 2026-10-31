import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';
import { Publicacion } from './publicacion.schema.js';

export type MeGustaDocument = HydratedDocument<MeGusta>;

@Schema({ collection: 'megustas', timestamps: { createdAt: true, updatedAt: false } })
export class MeGusta {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  usuario!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true })
  publicacion!: Types.ObjectId;

  createdAt!: Date;
}

export const MeGustaSchema = SchemaFactory.createForClass(MeGusta);

MeGustaSchema.index({ usuario: 1, publicacion: 1 }, { unique: true });
MeGustaSchema.index({ createdAt: 1 });
