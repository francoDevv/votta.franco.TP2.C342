import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Ingresá tu usuario o correo' })
  identificador!: string;

  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  password!: string;
}
