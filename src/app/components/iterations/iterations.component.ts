import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Iteration } from '../../models';

@Component({
  selector: 'app-iterations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/projects">Projects</a>
            <span>›</span>
            <a [routerLink]="['/projects', projectId(), 'use-cases']"
               [queryParams]="{ projectName: projectName() }">{{ projectName() }}</a>
            <span>›</span>
            <a [routerLink]="['/use-cases', useCaseId(), 'tasks']"
               [queryParams]="{ useCaseName: useCaseName(), projectId: projectId(), projectName: projectName() }">{{ useCaseName() }}</a>
            <span>›</span>
            <span>{{ taskName() }}</span>
          </div>
          <h1>Iterations</h1>
        </div>
        <button class="btn btn-primary" (click)="create()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Executar Tarefas
        </button>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando iterations...</div>
        } @else if (iterations().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <p>Nenhuma iteration encontrada. Execute as tarefas para criar!</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Criado em</th>
                  <th>Task ID</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (it of iterations(); track it.id; let i = $index) {
                  <tr>
                    <td><span class="seq-badge">{{ i + 1 }}</span></td>
                    <td class="td-name">{{ it.id }}</td>
                    <td>{{ it.created_date | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td style="color:var(--text-muted)">{{ it.task_id }}</td>
                    <td>
                      <div class="td-actions">
                        <button class="btn btn-danger" (click)="confirmDelete(it)" title="Excluir">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Iteration</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a iteration <strong>#{{ deletingIt()?.id }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteIt()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `
})
export class IterationsComponent implements OnInit {
  iterations = signal<Iteration[]>([]);
  loading = signal(true);
  showDeleteConfirm = signal(false);
  deletingIt = signal<Iteration | null>(null);
  taskId = signal(0);
  taskName = signal('');
  useCaseId = signal(0);
  useCaseName = signal('');
  projectId = signal(0);
  projectName = signal('');

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('taskId'));
    this.taskId.set(id);
    const qp = this.route.snapshot.queryParamMap;
    this.taskName.set(qp.get('taskName') || `Task ${id}`);
    this.useCaseId.set(Number(qp.get('useCaseId')) || 0);
    this.useCaseName.set(qp.get('useCaseName') || 'Use Case');
    this.projectId.set(Number(qp.get('projectId')) || 0);
    this.projectName.set(qp.get('projectName') || 'Projeto');
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getIterationsByTask(this.taskId()).subscribe({
      next: data => { this.iterations.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create() {
    this.api.createIteration({ task_id: this.taskId() }).subscribe(() => this.load());
  }

  confirmDelete(it: Iteration) { this.deletingIt.set(it); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingIt.set(null); }

  deleteIt() {
    const it = this.deletingIt();
    if (!it) return;
    this.api.deleteIteration(it.id).subscribe(() => { this.cancelDelete(); this.load(); });
  }
}
