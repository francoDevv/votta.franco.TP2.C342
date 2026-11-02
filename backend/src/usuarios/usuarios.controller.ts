import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { imagenOpcional } from '../common/pipes/imagen.pipe.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
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

  @Get()
  @Roles('administrador')
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile(imagenOpcional()) imagen: Express.Multer.File | undefined,
  ) {
    return this.usuariosService.registrar(dto, imagen, dto.perfil);
  }

  @Delete(':id')
  @Roles('administrador')
  deshabilitar(@Param('id', ParseIdPipe) id: string, @UsuarioActual() admin: UsuarioToken) {
    return this.usuariosService.cambiarEstado(id, false, admin.sub);
  }

  @Post(':id/habilitar')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id', ParseIdPipe) id: string, @UsuarioActual() admin: UsuarioToken) {
    return this.usuariosService.cambiarEstado(id, true, admin.sub);
  }
}
