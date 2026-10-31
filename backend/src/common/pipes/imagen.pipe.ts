import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

const MAX_IMAGEN_MB = 2;

export const imagenOpcional = () =>
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
  });
