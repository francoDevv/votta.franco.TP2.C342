import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imagenOpcional } from '../common/pipes/imagen.pipe.js';
import { AuthService } from './auth.service.js';
import { Publico } from './decorators/publico.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registrar(
    @Body() dto: RegistroDto,
    @UploadedFile(imagenOpcional()) imagen?: Express.Multer.File,
  ) {
    return this.authService.registrar(dto, imagen);
  }

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
