export interface AutorResumen {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  imagenPerfil: string | null;
}

export interface Publicacion {
  _id: string;
  autor: AutorResumen;
  titulo: string;
  mensaje: string;
  imagenUrl: string | null;
  restaurante: string;
  plato: string;
  puntaje: number;
  likesCount: number;
  comentariosCount: number;
  meGusta: boolean;
  createdAt: string;
}

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: AutorResumen;
  mensaje: string;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export type OrdenPublicaciones = 'fecha' | 'likes';

export interface EstadoMeGusta {
  likesCount: number;
  meGusta: boolean;
}
