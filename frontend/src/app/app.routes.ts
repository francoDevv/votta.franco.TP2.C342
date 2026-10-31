import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

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
        path: 'publicar',
        title: 'Publicar · Platito',
        loadComponent: () => import('./pages/publicar/publicar').then((m) => m.Publicar),
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
