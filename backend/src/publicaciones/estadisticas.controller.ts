import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('estadisticas')
@Roles('administrador')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(rango);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(rango);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(rango);
  }
}
