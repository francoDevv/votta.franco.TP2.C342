import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';

const MAX_IMAGEN_MB = 2;

// @Controller('auth') + @Post('registro') = POST /api/auth/registro
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // El front manda multipart/form-data (datos + archivo).
  // FileInterceptor saca el archivo del campo "imagenPerfil" y el resto queda en el body.
  // POST responde 201 Created por defecto.
  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registrar(
    @Body() dto: RegistroDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false, // la foto es opcional
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_IMAGEN_MB * 1024 * 1024,
            errorMessage: `La imagen no puede superar los ${MAX_IMAGEN_MB} MB`,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            errorMessage: 'La imagen debe ser JPG, PNG o WEBP',
          }),
        ],
      }),
    )
    imagen?: Express.Multer.File,
  ) {
    return this.authService.registrar(dto, imagen);
  }

  // Login no crea nada, así que responde 200 OK en vez del 201 por defecto de POST
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
