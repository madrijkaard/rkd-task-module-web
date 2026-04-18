import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'projects/:projectId/use-cases',
    loadComponent: () => import('./components/use-cases/use-cases.component').then(m => m.UseCasesComponent)
  },
  {
    path: 'use-cases/:useCaseId/tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'tasks/:taskId/iterations',
    loadComponent: () => import('./components/iterations/iterations.component').then(m => m.IterationsComponent)
  },
  { path: '**', redirectTo: 'projects' }
];
