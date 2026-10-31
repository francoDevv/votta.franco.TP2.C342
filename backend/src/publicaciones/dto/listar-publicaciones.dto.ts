import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export const ORDENES = ['fecha', 'likes'] as const;
export type Orden = (typeof ORDENES)[number];

export class ListarPublicacionesDto {
  @IsIn(ORDENES, { message: 'El orden debe ser "fecha" o "likes"' })
  @IsOptional()
  orden: Orden = 'fecha';

  @IsMongoId({ message: 'El usuario no es válido' })
  @IsOptional()
  usuario?: string;

  @Min(0, { message: 'offset no puede ser negativo' })
  @IsInt({ message: 'offset debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  offset: number = 0;

  @Max(50, { message: 'limit no puede superar 50' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @IsInt({ message: 'limit debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  limit: number = 10;
}
