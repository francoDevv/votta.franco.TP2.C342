import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// DTO = "Data Transfer Object": describe qué datos acepta la ruta y sus reglas.
// El ValidationPipe global (main.ts) lo usa para validar el body.
// ($property en un mensaje se reemplaza por el nombre del campo)
// Si algo falla, responde 400 con estos mensajes, sin llegar al controller.
export class RegistroDto {
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre!: string;

  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  apellido!: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  email!: string;

  @Matches(/^[a-zA-Z0-9_.]{3,20}$/, {
    message: 'El nombre de usuario debe tener entre 3 y 20 caracteres: letras, números, "_" o "."',
  })
  username!: string;

  @IsString({ message: '$property debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  // Un solo @Matches: si hay dos en el mismo campo, class-validator solo aplica uno
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  password!: string;

  // Que coincida con password se valida en el service
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Repetí la contraseña' })
  repetirPassword!: string;

  // Formato YYYY-MM-DD (lo que manda un <input type="date">)
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento!: string;

  @IsOptional()
  @IsString({ message: '$property debe ser texto' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;
}
