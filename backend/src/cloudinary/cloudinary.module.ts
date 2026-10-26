import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';

// Módulo chico y reutilizable: lo usan Auth (foto de perfil) y,
// en el sprint 2, Publicaciones (foto del plato).
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
