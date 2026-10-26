import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  // Importar estos módulos habilita inyectar UsuariosService, CloudinaryService y JwtService
  imports: [
    UsuariosModule,
    CloudinaryModule,
    // Firma los tokens con JWT_SECRET; vencen a los 15 minutos (lo pide el sprint 3)
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
