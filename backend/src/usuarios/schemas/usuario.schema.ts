import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Perfil = 'usuario' | 'administrador';
export type UsuarioDocument = HydratedDocument<Usuario>;

// @Schema convierte esta clase en un esquema de Mongoose.
// timestamps agrega createdAt y updatedAt solos.
@Schema({
  timestamps: true,
  toJSON: {
    // Al devolver un usuario en una respuesta, nunca viaja la contraseña
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

  // unique crea un índice en Mongo: dos usuarios no pueden tener el mismo email
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Se guarda en minúsculas para que "Franco" y "franco" cuenten como el mismo
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  // Hash de bcrypt, nunca la contraseña en texto plano.
  // select: false hace que no se traiga en las consultas salvo que se pida.
  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ trim: true, default: '' })
  descripcion!: string;

  // URL de la foto en Cloudinary (null si no subió foto)
  @Prop({ type: String, default: null })
  imagenPerfil!: string | null;

  @Prop({ type: String, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil!: Perfil;

  // Para la baja lógica del sprint 4: false = deshabilitado
  @Prop({ default: true })
  activo!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
