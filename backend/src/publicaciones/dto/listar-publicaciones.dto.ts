import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginacionDto } from '../../common/dto/paginacion.dto.js';

export const ORDENES = ['fecha', 'likes'] as const;
export type Orden = (typeof ORDENES)[number];

export class ListarPublicacionesDto extends PaginacionDto {
  @IsIn(ORDENES, { message: 'El orden debe ser "fecha" o "likes"' })
  @IsOptional()
  orden: Orden = 'fecha';

  @IsMongoId({ message: 'El usuario no es válido' })
  @IsOptional()
  usuario?: string;
}
