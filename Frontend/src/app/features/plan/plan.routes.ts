import { Routes } from '@angular/router';

/**
 * ============================================================================
 * RUTAS DEL MÓDULO DE PLANES Y TARIFAS (plan.routes.ts)
 * ============================================================================
 * Define las rutas para listar, crear y editar los paquetes de internet
 * (velocidades en Mbps y sus tarifas por modalidad Mensual, Anual, etc.).
 */
export const PLAN_ROUTES: Routes = [
  {
    // Ruta: /plan -> Lista de planes
    path: '',
    loadComponent: () =>
      import('./pages/lista-plan/lista-plan').then((m) => m.ListaPlan),
  },
  {
    // Alias: /plan/lista-plan -> Lista de planes
    path: 'lista-plan',
    loadComponent: () =>
      import('./pages/lista-plan/lista-plan').then((m) => m.ListaPlan),
  },
  {
    // Ruta: /plan/insertar-plan -> Crear un nuevo plan con sus tarifas iniciales
    path: 'insertar-plan',
    loadComponent: () =>
      import('./pages/insertar-plan/insertar-plan').then((m) => m.InsertarPlan),
  },
  {
    // Ruta: /plan/actualizar-plan/:id -> Editar un plan y administrar sus tarifas
    path: 'actualizar-plan/:id',
    loadComponent: () =>
      import('./pages/actualizar-plan/actualizar-plan').then((m) => m.ActualizarPlan),
  },
];
