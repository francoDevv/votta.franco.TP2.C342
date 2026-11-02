import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { invitadoGuard, sesionGuard } from './guards/sesion.guard';
import { Cargando } from './pages/cargando/cargando';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Platito', component: Cargando },

  {
    path: 'login',
    title: 'Ingresar · Platito',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Platito',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },

  {
    path: '',
    component: Layout,
    canActivate: [sesionGuard],
    children: [
      {
        path: 'publicaciones',
        title: 'Publicaciones · Platito',
        loadComponent: () =>
          import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'publicaciones/:id',
        title: 'Publicación · Platito',
        loadComponent: () =>
          import('./pages/publicacion-detalle/publicacion-detalle').then(
            (m) => m.PublicacionDetalle,
          ),
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
      {
        path: 'mi-perfil/editar',
        title: 'Editar perfil · Platito',
        loadComponent: () =>
          import('./pages/editar-perfil/editar-perfil').then((m) => m.EditarPerfil),
      },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
          {
            path: 'usuarios',
            title: 'Usuarios · Panel · Platito',
            loadComponent: () =>
              import('./pages/dashboard/usuarios/usuarios').then((m) => m.Usuarios),
          },
          {
            path: 'estadisticas',
            title: 'Estadísticas · Panel · Platito',
            loadComponent: () =>
              import('./pages/dashboard/estadisticas/estadisticas').then(
                (m) => m.Estadisticas,
              ),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
