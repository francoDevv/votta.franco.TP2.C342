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
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido!: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;

  @Matches(/^[a-zA-Z0-9_.]{3,20}$/, {
    message: 'El nombre de usuario debe tener entre 3 y 20 caracteres: letras, números, "_" o "."',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username!: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Repetí la contraseña' })
  repetirPassword!: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento!: string;

  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  @IsString({ message: '$property debe ser texto' })
  @IsOptional()
  descripcion?: string;
}
