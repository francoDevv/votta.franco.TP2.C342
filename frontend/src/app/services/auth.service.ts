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

  private readonly tokenActual = signal<string | null>(this.leerGuardado(CLAVE_TOKEN));
  readonly tokenSesion = this.tokenActual.asReadonly();
  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());
  readonly sesionVerificada = signal(false);

  get token(): string | null {
    return this.tokenActual();
  }

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

  autorizar(): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/autorizar`, {}).pipe(
      tap((usuario) => {
        this.actualizarUsuario(usuario);
        this.sesionVerificada.set(true);
      }),
    );
  }

  refrescar(): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.url}/refrescar`, {})
      .pipe(tap(({ token }) => this.guardarToken(token)));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.tokenActual.set(null);
    this.usuario.set(null);
    this.sesionVerificada.set(false);
  }

  actualizarUsuario(usuario: Usuario): void {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  tiemposToken(token: string | null = this.token): { emitido: number; vence: number } | null {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { iat, exp } = JSON.parse(atob(base64)) as { iat?: number; exp?: number };
      return iat && exp ? { emitido: iat * 1000, vence: exp * 1000 } : null;
    } catch {
      return null;
    }
  }

  private guardarSesion({ usuario, token }: RespuestaAuth): void {
    this.guardarToken(token);
    this.actualizarUsuario(usuario);
    this.sesionVerificada.set(true);
  }

  private guardarToken(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.tokenActual.set(token);
  }

  private leerUsuarioGuardado(): Usuario | null {
    try {
      const guardado = this.leerGuardado(CLAVE_USUARIO);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private leerGuardado(clave: string): string | null {
    try {
      return globalThis.localStorage?.getItem(clave) ?? null;
    } catch {
      return null;
    }
  }
}
