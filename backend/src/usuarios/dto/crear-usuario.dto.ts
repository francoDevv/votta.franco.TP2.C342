import { IsIn, IsNotEmpty } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';
import type { Perfil } from '../schemas/usuario.schema.js';

export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil debe ser "usuario" o "administrador"',
  })
  @IsNotEmpty({ message: 'Elegí el perfil del usuario' })
  perfil!: Perfil;
}
