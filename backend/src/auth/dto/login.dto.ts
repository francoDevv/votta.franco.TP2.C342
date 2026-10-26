import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Puede ser el correo o el nombre de usuario
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Ingresá tu usuario o correo' })
  identificador!: string;

  // Llega sin encriptar; se compara contra el hash guardado
  @IsString({ message: '$property debe ser texto' })
  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  password!: string;
}
