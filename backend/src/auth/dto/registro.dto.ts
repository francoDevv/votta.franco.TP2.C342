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
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  password!: string;

  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Repetí la contraseña' })
  repetirPassword!: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento!: string;

  @IsOptional()
  @IsString({ message: '$property debe ser texto' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;
}
