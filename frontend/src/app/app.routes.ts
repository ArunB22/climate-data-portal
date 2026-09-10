import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/layout/public-layout').then((m) => m.PublicLayout),
    children: [
      { path: '', loadComponent: () => import('./features/public/landing/landing').then((m) => m.Landing) },
      {
        path: 'climate',
        loadComponent: () => import('./features/public/domain-page/domain-page').then((m) => m.DomainPage),
        data: { domain: 'CLIMATE' },
      },
      {
        path: 'energy',
        loadComponent: () => import('./features/public/domain-page/domain-page').then((m) => m.DomainPage),
        data: { domain: 'ENERGY' },
      },
      {
        path: 'power',
        loadComponent: () => import('./features/public/domain-page/domain-page').then((m) => m.DomainPage),
        data: { domain: 'POWER' },
      },
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.Login) },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/shared/authenticated-layout/authenticated-layout').then((m) => m.AuthenticatedLayout),
    canActivate: [roleGuard('ADMIN', 'SUPER_ADMIN')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'add',
        loadComponent: () => import('./features/admin/add-dataset/add-dataset').then((m) => m.AddDataset),
      },
    ],
  },
  {
    path: 'superadmin',
    loadComponent: () =>
      import('./features/shared/authenticated-layout/authenticated-layout').then((m) => m.AuthenticatedLayout),
    canActivate: [roleGuard('SUPER_ADMIN')],
    children: [
      { path: '', redirectTo: 'datasets', pathMatch: 'full' },
      {
        path: 'datasets',
        loadComponent: () =>
          import('./features/superadmin/datasets/superadmin-datasets').then((m) => m.SuperAdminDatasets),
      },
      {
        path: 'admins',
        loadComponent: () => import('./features/superadmin/admins/superadmin-admins').then((m) => m.SuperAdminAdmins),
      },
    ],
  },
  { path: '**', loadComponent: () => import('./features/shared/not-found/not-found').then((m) => m.NotFound) },
];
