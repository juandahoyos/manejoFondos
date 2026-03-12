import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'panel-principal',
    pathMatch: 'full'
  },
  {
    path: 'panel-principal',
    // Usamos lazy loading (carga perezosa) para optimizar el rendimiento, una excelente práctica
    loadComponent: () => import('./features/panel-principal/panel-principal').then(m => m.PanelPrincipalComponent)  }
];