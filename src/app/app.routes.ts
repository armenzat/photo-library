import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Photos',
    loadComponent: () => import('./pages/photos/photos').then((m) => m.Photos),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'photos/:id',
    title: 'Photo',
    loadComponent: () => import('./pages/photo-detail/photo-detail').then((m) => m.PhotoDetail),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
