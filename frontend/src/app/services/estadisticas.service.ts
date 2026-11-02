import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
} from '../models/estadisticas';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(rango: RangoFechas): Observable<PublicacionesPorUsuario> {
    return this.http.get<PublicacionesPorUsuario>(`${this.url}/publicaciones-por-usuario`, {
      params: this.params(rango),
    });
  }

  comentariosPorDia(rango: RangoFechas): Observable<ComentariosPorDia> {
    return this.http.get<ComentariosPorDia>(`${this.url}/comentarios-por-dia`, {
      params: this.params(rango),
    });
  }

  comentariosPorPublicacion(rango: RangoFechas): Observable<ComentariosPorPublicacion> {
    return this.http.get<ComentariosPorPublicacion>(`${this.url}/comentarios-por-publicacion`, {
      params: this.params(rango),
    });
  }

  private params({ desde, hasta }: RangoFechas): HttpParams {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}
