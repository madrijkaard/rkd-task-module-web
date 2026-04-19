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
            <a routerLink="/projects">Projetos</a>
            <span>›</span>
            <a [routerLink]="['/projects', projectId(), 'use-cases']"
               [queryParams]="{ projectId: projectId() }">Projeto</a>
            <span>›</span>
            <span>Casos de Uso</span>
          </div>
          <h1>Tarefas</h1>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" (click)="openModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova Tarefa
          </button>
          <button class="btn btn-ghost" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Executar Tarefas
          </button>
        </div>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando tarefas...</div>
        } @else if (tasks().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <p>Nenhuma tarefa encontrada. Crie a primeira!</p>
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
                    <td class="td-name" (click)="goToIterations(task)">
                      <span class="name-cell" [title]="task.name">{{ task.name }}</span>
                    </td>
                    <td (click)="goToIterations(task)">
                      <span style="font-family:monospace;font-size:12px;background:var(--code-bg);padding:2px 6px;border-radius:4px;border:1px solid var(--code-border)">{{ task.type }}</span>
                    </td>
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

    <!-- ══ CREATE / EDIT MODAL ══ -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" style="max-width:580px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingTask() ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>
            <button class="btn-close" (click)="closeModal()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nome</label>
              <input class="form-control" type="text" [(ngModel)]="formName"
                placeholder="Ex: VALIDAR TOKEN" maxlength="50"
                (input)="onNameInput($event)" />
              <span style="font-size:11px;color:var(--text-muted)">Maiúsculas, números, - _ /</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label>Tipo</label>
                @if (typesLoading()) {
                  <div class="form-control" style="color:var(--text-muted);display:flex;align-items:center;gap:8px">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Carregando...
                  </div>
                } @else if (typesError()) {
                  <div style="color:var(--danger);font-size:13px">
                    Falha ao carregar.
                    <button class="btn btn-ghost btn-sm" (click)="loadTypes()">Tentar novamente</button>
                  </div>
                } @else {
                  <select class="form-control" [(ngModel)]="formType">
                    <option value="" disabled>Selecione...</option>
                    @for (t of taskTypes(); track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                }
              </div>
              <div class="form-group">
                <label>Path</label>
                <input class="form-control" type="text" [(ngModel)]="formPath"
                  placeholder="/caminho/do/arquivo" (input)="onPathInput($event)" />
                <span style="font-size:11px;color:var(--text-muted)">Minúsculas, letras, números, / - _</span>
              </div>
            </div>
            <div class="form-group">
              <label>System Prompt</label>
              <textarea class="form-control" [(ngModel)]="formSystemPrompt"
                placeholder="Instruções de sistema para o modelo de IA..." style="min-height:90px"></textarea>
            </div>
            <div class="form-group">
              <label>User Prompt</label>
              <textarea class="form-control" [(ngModel)]="formUserPrompt"
                placeholder="Instrução do usuário / tarefa a executar..." style="min-height:90px"></textarea>
            </div>
            @if (saveError()) {
              <div style="padding:10px 14px;background:var(--danger-light);border:1px solid #FECACA;border-radius:var(--radius);color:var(--danger);font-size:13px">
                {{ saveError() }}
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="!formName.trim() || !formType">
              {{ editingTask() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ══ DELETE CONFIRM MODAL ══ -->
    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Tarefa</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a tarefa <strong>{{ deletingTask()?.name }}</strong>?</p>
            @if (deleteError()) {
              <div style="margin-top:12px;padding:10px 14px;background:var(--danger-light);border:1px solid #FECACA;border-radius:var(--radius);color:var(--danger);font-size:13px">
                {{ deleteError() }}
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">{{ deleteError() ? 'Fechar' : 'Cancelar' }}</button>
            @if (!deleteError()) {
              <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteTask()">Excluir</button>
            }
          </div>
        </div>
      </div>
    }

    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `
})
export class TasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  taskTypes = signal<string[]>([]);
  loading = signal(true);
  typesLoading = signal(false);
  typesError = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingTask = signal<Task | null>(null);
  deletingTask = signal<Task | null>(null);
  deleteError = signal('');
  saveError = signal('');
  useCaseId = signal(0);
  projectId = signal(0);
  formName = '';
  formType = '';
  formPath = '';
  formSystemPrompt = '';
  formUserPrompt = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('useCaseId'));
    this.useCaseId.set(id);
    const qp = this.route.snapshot.queryParamMap;
    this.projectId.set(Number(qp.get('projectId')) || 0);
    this.load();
    this.loadTypes();
  }

  load() {
    this.loading.set(true);
    this.api.getTasksByUseCase(this.useCaseId()).subscribe({
      next: data => { this.tasks.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadTypes() {
    this.typesLoading.set(true);
    this.typesError.set(false);
    this.api.getTaskTypes().subscribe({
      next: data => { this.taskTypes.set(data); this.typesLoading.set(false); },
      error: () => { this.typesError.set(true); this.typesLoading.set(false); }
    });
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.toUpperCase().replace(/[^A-Z0-9_\/-]/g, '');
    this.formName = clean; input.value = clean;
  }

  onPathInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.toLowerCase().replace(/[^a-z0-9/_-]/g, '');
    this.formPath = clean; input.value = clean;
  }

  goToIterations(task: Task) {
    this.router.navigate(
      ['/tasks', task.id, 'iterations'],
      { queryParams: { taskId: task.id, useCaseId: this.useCaseId(), projectId: this.projectId() } }
    );
  }

  openModal(task?: Task) {
    this.editingTask.set(task || null);
    this.formName = task?.name || '';
    this.formType = task?.type || '';
    this.formPath = task?.path || '';
    this.formSystemPrompt = task?.system_prompt || '';
    this.formUserPrompt = task?.user_prompt || '';
    this.saveError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.saveError.set('');
    this.formName = ''; this.formType = ''; this.formPath = '';
    this.formSystemPrompt = ''; this.formUserPrompt = '';
    this.editingTask.set(null);
  }

  save() {
    const name = this.formName.trim();
    if (!name || !this.formType) return;
    this.saveError.set('');
    const editing = this.editingTask();
    const payload = {
      name, type: this.formType,
      path: this.formPath.trim(),
      system_prompt: this.formSystemPrompt.trim(),
      user_prompt: this.formUserPrompt.trim(),
      use_case_id: this.useCaseId()
    };
    const obs = editing ? this.api.updateTask(editing.id, payload) : this.api.createTask(payload);
    obs.subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: (err) => this.saveError.set(err?.error?.message || 'Erro ao salvar. Tente novamente.')
    });
  }

  confirmDelete(task: Task) { this.deletingTask.set(task); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingTask.set(null); this.deleteError.set(''); }

  deleteTask() {
    const t = this.deletingTask();
    if (!t) return;
    this.api.deleteTask(t.id).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: (err) => this.deleteError.set(err?.error?.message || 'Erro ao excluir. Tente novamente.')
    });
  }
}
