import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Task } from '../../models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
            <span>{{ useCaseName() }}</span>
          </div>
          <h1>Tasks</h1>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Task
        </button>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando tasks...</div>
        } @else if (tasks().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <p>Nenhuma task encontrada. Crie a primeira!</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Seq.</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Path</th>
                  <th>Modificado em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (task of tasks(); track task.id) {
                  <tr class="row-link">
                    <td><span class="seq-badge">{{ task.sequence }}</span></td>
                    <td class="td-name" (click)="goToIterations(task)">{{ task.name }}</td>
                    <td (click)="goToIterations(task)"><span style="font-family:monospace;font-size:12px;background:var(--bg);padding:2px 6px;border-radius:4px;border:1px solid var(--border)">{{ task.type }}</span></td>
                    <td (click)="goToIterations(task)" style="color:var(--text-muted);font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ task.path }}</td>
                    <td (click)="goToIterations(task)">{{ task.last_modified_date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="td-actions">
                        <button class="btn btn-edit" (click)="openModal(task)" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-danger" (click)="confirmDelete(task)" title="Excluir">
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

    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" style="max-width:540px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingTask() ? 'Editar Task' : 'Nova Task' }}</h2>
            <button class="btn-close" (click)="closeModal()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="grid-column:1/-1">
                <label>Nome</label>
                <input class="form-control" type="text" [(ngModel)]="formName" placeholder="Nome da task" maxlength="50" />
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <input class="form-control" type="text" [(ngModel)]="formType" placeholder="Ex: script, api..." maxlength="50" />
              </div>
              <div class="form-group">
                <label>Path</label>
                <input class="form-control" type="text" [(ngModel)]="formPath" placeholder="/caminho/do/arquivo" />
              </div>
            </div>
            <div class="form-group">
              <label>Prompt</label>
              <textarea class="form-control" [(ngModel)]="formPrompt" placeholder="Descreva o prompt..." style="min-height:100px"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="!formName.trim()">
              {{ editingTask() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Task</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a task <strong>{{ deletingTask()?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteTask()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `
})
export class TasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingTask = signal<Task | null>(null);
  deletingTask = signal<Task | null>(null);
  useCaseId = signal(0);
  useCaseName = signal('');
  projectId = signal(0);
  projectName = signal('');
  formName = '';
  formType = '';
  formPath = '';
  formPrompt = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('useCaseId'));
    this.useCaseId.set(id);
    const qp = this.route.snapshot.queryParamMap;
    this.useCaseName.set(qp.get('useCaseName') || `Use Case ${id}`);
    this.projectId.set(Number(qp.get('projectId')) || 0);
    this.projectName.set(qp.get('projectName') || 'Projeto');
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getTasksByUseCase(this.useCaseId()).subscribe({
      next: data => { this.tasks.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goToIterations(task: Task) {
    this.router.navigate(
      ['/tasks', task.id, 'iterations'],
      {
        queryParams: {
          taskName: task.name,
          useCaseId: this.useCaseId(),
          useCaseName: this.useCaseName(),
          projectId: this.projectId(),
          projectName: this.projectName()
        }
      }
    );
  }

  openModal(task?: Task) {
    this.editingTask.set(task || null);
    this.formName = task?.name || '';
    this.formType = task?.type || '';
    this.formPath = task?.path || '';
    this.formPrompt = task?.prompt || '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formName = ''; this.formType = '';
    this.formPath = ''; this.formPrompt = '';
    this.editingTask.set(null);
  }

  save() {
    const name = this.formName.trim();
    if (!name) return;
    const editing = this.editingTask();
    // sequence: mantém o existente ao editar, ou envia 0 ao criar (backend gera automaticamente)
    const sequence = editing?.sequence ?? 0;
    const payload = {
      name,
      sequence,
      type: this.formType.trim(),
      path: this.formPath.trim(),
      prompt: this.formPrompt.trim(),
      use_case_id: this.useCaseId()
    };
    if (editing) {
      this.api.updateTask(editing.id, payload).subscribe(() => { this.closeModal(); this.load(); });
    } else {
      this.api.createTask(payload).subscribe(() => { this.closeModal(); this.load(); });
    }
  }

  confirmDelete(task: Task) { this.deletingTask.set(task); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingTask.set(null); }

  deleteTask() {
    const t = this.deletingTask();
    if (!t) return;
    this.api.deleteTask(t.id).subscribe(() => { this.cancelDelete(); this.load(); });
  }
}
