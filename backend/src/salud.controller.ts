import { Controller, Get } from '@nestjs/common';
import { Publico } from './auth/decorators/publico.decorator.js';

@Controller('salud')
export class SaludController {
  @Publico()
  @Get()
  estado() {
    return { estado: 'ok', fecha: new Date().toISOString() };
  }
}
