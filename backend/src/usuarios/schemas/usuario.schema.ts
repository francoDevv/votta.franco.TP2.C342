import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Perfil = 'usuario' | 'administrador';
export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  apellido!: string;

 @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ trim: true, default: '' })
  descripcion!: string;

  @Prop({ type: String, default: null })
  imagenPerfil!: string | null;

  @Prop({ type: String, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil!: Perfil;

  @Prop({ default: true })
  activo!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
