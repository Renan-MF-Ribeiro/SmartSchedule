import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'schedules/new',
    loadComponent: () => import('./features/schedule-form/schedule-form.component').then(m => m.ScheduleFormComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
