import { Body, Controller, Get, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { imagenOpcional } from '../common/pipes/imagen.pipe.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  miUsuario(@UsuarioActual() usuario: UsuarioToken) {
    return this.usuariosService.buscarPorId(usuario.sub);
  }

  @Put('me')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  editarMiPerfil(
    @Body() dto: EditarPerfilDto,
    @UploadedFile(imagenOpcional()) imagen: Express.Multer.File | undefined,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.usuariosService.actualizarPerfil(usuario.sub, dto, imagen);
  }
}
