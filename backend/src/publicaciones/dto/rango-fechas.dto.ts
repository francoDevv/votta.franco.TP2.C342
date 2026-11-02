import { IsOptional, Matches } from 'class-validator';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class RangoFechasDto {
  @Matches(FORMATO_FECHA, { message: 'desde debe tener el formato AAAA-MM-DD' })
  @IsOptional()
  desde?: string;

  @Matches(FORMATO_FECHA, { message: 'hasta debe tener el formato AAAA-MM-DD' })
  @IsOptional()
  hasta?: string;
}
