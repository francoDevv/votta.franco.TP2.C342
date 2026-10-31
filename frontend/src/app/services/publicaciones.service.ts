import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Comentario,
  EstadoMeGusta,
  OrdenPublicaciones,
  Pagina,
  Publicacion,
} from '../models/publicacion';

export interface FiltrosPublicaciones {
  orden?: OrdenPublicaciones;
  usuario?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/publicaciones`;

  listar(filtros: FiltrosPublicaciones = {}): Observable<Pagina<Publicacion>> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined) params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<Publicacion>>(this.url, { params });
  }

  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  darMeGusta(id: string): Observable<EstadoMeGusta> {
    return this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string): Observable<EstadoMeGusta> {
    return this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`);
  }

  obtener(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  listarComentarios(id: string, offset = 0, limit = 5): Observable<Pagina<Comentario>> {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<Pagina<Comentario>>(`${this.url}/${id}/comentarios`, { params });
  }

  comentar(id: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.url}/${id}/comentarios`, { mensaje });
  }

  editarComentario(id: string, comentarioId: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.url}/${id}/comentarios/${comentarioId}`, {
      mensaje,
    });
  }
}
