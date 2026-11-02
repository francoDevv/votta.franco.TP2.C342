import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../../usuarios/schemas/usuario.schema.js';

export const ROLES = 'roles';

export const Roles = (...perfiles: Perfil[]) => SetMetadata(ROLES, perfiles);
