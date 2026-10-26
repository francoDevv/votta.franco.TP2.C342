import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';

@Module({
  // Registra el modelo Usuario para poder inyectarlo en este módulo
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // exports: otros módulos (como Auth) pueden usar UsuariosService
  exports: [UsuariosService],
})
export class UsuariosModule {}
