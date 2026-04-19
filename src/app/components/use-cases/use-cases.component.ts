import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UseCase } from '../../models';

@Component({
  selector: 'app-use-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/projects">Projetos</a>
            <span>›</span>
            <span>Projeto</span>
          </div>
          <h1>Casos de Uso</h1>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Caso de Uso
        </button>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando casos de uso...</div>
        } @else if (useCases().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>Nenhum caso de uso encontrado. Crie o primeiro!</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Especificação</th>
                  <th>Modificado em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (uc of useCases(); track uc.id) {
                  <tr class="row-link">
                    <td>{{ uc.id }}</td>
                    <td class="td-name" (click)="goToTasks(uc)">
                      <span class="name-cell" [title]="uc.name">{{ uc.name }}</span>
                    </td>
                    <td (click)="goToTasks(uc)" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted)">{{ uc.specification }}</td>
                    <td (click)="goToTasks(uc)">{{ uc.last_modified_date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="td-actions">
                        <button class="btn btn-edit" (click)="openModal(uc)" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-danger" (click)="confirmDelete(uc)" title="Excluir">
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
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingUC() ? 'Editar Caso de Uso' : 'Novo Caso de Uso' }}</h2>
            <button class="btn-close" (click)="closeModal()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nome</label>
              <input class="form-control" type="text" [(ngModel)]="formName"
                placeholder="Ex: AUTENTICACAO USUARIO" maxlength="50"
                (input)="onNameInput($event)" />
              <span style="font-size:11px;color:var(--text-muted)">Maiúsculas, números, - _ /</span>
            </div>
            <div class="form-group">
              <label>Especificação</label>
              <textarea class="form-control" [(ngModel)]="formSpecification"
                placeholder="Descreva a especificação do caso de uso..." style="min-height:100px"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="!formName.trim()">
              {{ editingUC() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Caso de Uso</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o caso de uso <strong>{{ deletingUC()?.name }}</strong>?</p>
            @if (deleteError()) {
              <div style="margin-top:12px;padding:10px 14px;background:var(--danger-light);border:1px solid #FECACA;border-radius:var(--radius);color:var(--danger);font-size:13px">
                {{ deleteError() }}
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">{{ deleteError() ? 'Fechar' : 'Cancelar' }}</button>
            @if (!deleteError()) {
              <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteUC()">Excluir</button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class UseCasesComponent implements OnInit {
  useCases = signal<UseCase[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingUC = signal<UseCase | null>(null);
  deletingUC = signal<UseCase | null>(null);
  deleteError = signal('');
  projectId = signal(0);
  formName = '';
  formSpecification = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('projectId'));
    this.projectId.set(id);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getUseCasesByProject(this.projectId()).subscribe({
      next: data => { this.useCases.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.toUpperCase().replace(/[^A-Z0-9_\/-]/g, '');
    this.formName = clean;
    input.value = clean;
  }

  goToTasks(uc: UseCase) {
    this.router.navigate(
      ['/use-cases', uc.id, 'tasks'],
      { queryParams: { useCaseId: uc.id, projectId: this.projectId() } }
    );
  }

  openModal(uc?: UseCase) {
    this.editingUC.set(uc || null);
    this.formName = uc?.name || '';
    this.formSpecification = uc?.specification || '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formName = ''; this.formSpecification = '';
    this.editingUC.set(null);
  }

  save() {
    const name = this.formName.trim();
    if (!name) return;
    const payload = { name, specification: this.formSpecification.trim(), project_id: this.projectId() };
    const editing = this.editingUC();
    if (editing) {
      this.api.updateUseCase(editing.id, payload).subscribe(() => { this.closeModal(); this.load(); });
    } else {
      this.api.createUseCase(payload).subscribe(() => { this.closeModal(); this.load(); });
    }
  }

  confirmDelete(uc: UseCase) { this.deletingUC.set(uc); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingUC.set(null); this.deleteError.set(''); }

  deleteUC() {
    const uc = this.deletingUC();
    if (!uc) return;
    this.api.deleteUseCase(uc.id).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: (err) => {
        const msg = err?.error?.message;
        this.deleteError.set(msg || 'Erro ao excluir. Tente novamente.');
      }
    });
  }
}
