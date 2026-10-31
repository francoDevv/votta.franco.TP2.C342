import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ComentarioDto {
  @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  mensaje!: string;
}
