
export type Perfil = 'usuario' | 'administrador';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string | null;
  perfil: Perfil;
  activo: boolean;
  createdAt: string;
}

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}
