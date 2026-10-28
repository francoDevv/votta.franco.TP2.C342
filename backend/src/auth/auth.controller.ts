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


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registrar(
    @Body() dto: RegistroDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false, 
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
