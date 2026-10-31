import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CrearPublicacionDto {
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo!: string;

  @MaxLength(1000, { message: 'La reseña no puede superar los 1000 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Contá qué te pareció el plato' })
  mensaje!: string;

  @MaxLength(80, { message: 'El restaurante no puede superar los 80 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Indicá el restaurante' })
  restaurante!: string;

  @MaxLength(80, { message: 'El plato no puede superar los 80 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Indicá el plato' })
  plato!: string;

  @Max(5, { message: 'El puntaje máximo es 5' })
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @IsInt({ message: 'El puntaje debe ser un número entero del 1 al 5' })
  @IsDefined({ message: 'Elegí un puntaje del 1 al 5' })
  @Type(() => Number)
  puntaje!: number;
}
