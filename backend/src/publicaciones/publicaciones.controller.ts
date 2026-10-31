import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { imagenOpcional } from '../common/pipes/imagen.pipe.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile(imagenOpcional()) imagen: Express.Multer.File | undefined,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.publicacionesService.crear(dto, usuario.sub, imagen);
  }

  @Get()
  listar(@Query() filtros: ListarPublicacionesDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.listar(filtros, usuario.sub);
  }

  @Get(':id')
  obtener(@Param('id', ParseIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.obtener(id, usuario.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ParseIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.darMeGusta(id, usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ParseIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.quitarMeGusta(id, usuario.sub);
  }
}
