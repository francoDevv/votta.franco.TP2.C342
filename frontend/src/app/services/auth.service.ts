import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario';

const CLAVE_TOKEN = 'platito_token';
const CLAVE_USUARIO = 'platito_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;

  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  registrar(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/registro`, datos)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/login`, { identificador, password })
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private guardarSesion({ usuario, token }: RespuestaAuth): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
