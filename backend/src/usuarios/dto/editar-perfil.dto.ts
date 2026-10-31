import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class EditarPerfilDto {
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido!: string;

  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsOptional()
  descripcion?: string;
}
