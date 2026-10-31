import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface.js';
import { PaginacionDto } from '../common/dto/paginacion.dto.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { ComentariosService } from './comentarios.service.js';
import { ComentarioDto } from './dto/comentario.dto.js';

@Controller('publicaciones/:publicacionId/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId', ParseIdPipe) publicacionId: string,
    @Query() paginacion: PaginacionDto,
  ) {
    return this.comentariosService.listar(publicacionId, paginacion);
  }

  @Post()
  crear(
    @Param('publicacionId', ParseIdPipe) publicacionId: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.comentariosService.crear(publicacionId, dto, usuario.sub);
  }

  @Put(':comentarioId')
  editar(
    @Param('publicacionId', ParseIdPipe) publicacionId: string,
    @Param('comentarioId', ParseIdPipe) comentarioId: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.comentariosService.editar(publicacionId, comentarioId, dto, usuario.sub);
  }
}
