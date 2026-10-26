// Forma de los datos que devuelve el backend

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

/** Respuesta de /auth/login y /auth/registro */
export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}
