import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginacionDto {
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
