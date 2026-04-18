import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project, ProjectPayload,
  UseCase, UseCasePayload,
  Task, TaskPayload,
  Iteration, IterationPayload
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  // Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/projects/${id}`);
  }
  createProject(payload: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, payload);
  }
  updateProject(id: number, payload: ProjectPayload): Observable<Project> {
    return this.http.put<Project>(`${this.base}/projects/${id}`, payload);
  }
  deleteProject(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/projects/${id}`);
  }

  // Use Cases
  getUseCasesByProject(projectId: number): Observable<UseCase[]> {
    return this.http.get<UseCase[]>(`${this.base}/projects/${projectId}/use-cases`);
  }
  getUseCase(id: number): Observable<UseCase> {
    return this.http.get<UseCase>(`${this.base}/use-cases/${id}`);
  }
  createUseCase(payload: UseCasePayload): Observable<UseCase> {
    return this.http.post<UseCase>(`${this.base}/use-cases`, payload);
  }
  updateUseCase(id: number, payload: UseCasePayload): Observable<UseCase> {
    return this.http.put<UseCase>(`${this.base}/use-cases/${id}`, payload);
  }
  deleteUseCase(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/use-cases/${id}`);
  }

  // Tasks
  getTasksByUseCase(useCaseId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/use-cases/${useCaseId}/tasks`);
  }
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/tasks/${id}`);
  }
  createTask(payload: TaskPayload): Observable<Task> {
    return this.http.post<Task>(`${this.base}/tasks`, payload);
  }
  updateTask(id: number, payload: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, payload);
  }
  deleteTask(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/tasks/${id}`);
  }

  // Iterations
  getIterationsByTask(taskId: number): Observable<Iteration[]> {
    return this.http.get<Iteration[]>(`${this.base}/tasks/${taskId}/iterations`);
  }
  getIteration(id: number): Observable<Iteration> {
    return this.http.get<Iteration>(`${this.base}/iterations/${id}`);
  }
  createIteration(payload: IterationPayload): Observable<Iteration> {
    return this.http.post<Iteration>(`${this.base}/iterations`, payload);
  }
  updateIteration(id: number, payload: IterationPayload): Observable<Iteration> {
    return this.http.put<Iteration>(`${this.base}/iterations/${id}`, payload);
  }
  deleteIteration(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/iterations/${id}`);
  }
}
