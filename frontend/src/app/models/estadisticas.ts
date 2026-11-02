export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface PublicacionesPorUsuario extends RangoFechas {
  datos: {
    usuarioId: string;
    nombre: string;
    apellido: string;
    username: string;
    cantidad: number;
  }[];
}

export interface ComentariosPorDia extends RangoFechas {
  total: number;
  dias: { fecha: string; cantidad: number }[];
}

export interface ComentariosPorPublicacion extends RangoFechas {
  datos: { publicacionId: string; titulo: string; activa: boolean; cantidad: number }[];
}
