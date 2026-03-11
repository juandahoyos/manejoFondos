import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    // Usamos lazy loading (carga perezosa) para optimizar el rendimiento, una excelente práctica
    loadComponent: () => import('./features/panel-principal/panel-principal').then(m => m.PanelPrincipalComponent)  }
];