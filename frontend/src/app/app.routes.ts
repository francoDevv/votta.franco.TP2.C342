import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  // Va primero: si no, la ruta '' del Layout atrapa la raíz y muestra una página vacía
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Pantallas de acceso: sin navbar
  {
    path: 'login',
    title: 'Ingresar · Platito',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Platito',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },

  // Pantallas internas: van dentro del Layout (navbar + contenido).
  // En el sprint 3 se le agrega un guard acá para exigir sesión.
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'publicaciones',
        title: 'Publicaciones · Platito',
        loadComponent: () =>
          import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'mi-perfil',
        title: 'Mi perfil · Platito',
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
