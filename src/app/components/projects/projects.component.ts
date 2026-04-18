import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Project } from '../../models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Projetos</h1>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Projeto
        </button>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando projetos...</div>
        } @else if (projects().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <p>Nenhum projeto encontrado. Crie o primeiro!</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Modificado em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (project of projects(); track project.id) {
                  <tr class="row-link">
                    <td>{{ project.id }}</td>
                    <td class="td-name" (click)="goToUseCases(project)">{{ project.name }}</td>
                    <td (click)="goToUseCases(project)">{{ project.last_modified_date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="td-actions">
                        <button class="btn btn-edit" (click)="openModal(project)" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-danger" (click)="confirmDelete(project)" title="Excluir">
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
            <h2>{{ editingProject() ? 'Editar Projeto' : 'Novo Projeto' }}</h2>
            <button class="btn-close" (click)="closeModal()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="pname">Nome do Projeto</label>
              <input id="pname" class="form-control" type="text" [(ngModel)]="formName"
                placeholder="Ex: SISTEMA GESTAO" maxlength="50"
                (input)="onNameInput($event)" />
              <span style="font-size:11px;color:var(--text-muted)">Maiúsculas, números, - _ /</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="!formName.trim()">
              {{ editingProject() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Projeto</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o projeto <strong>{{ deletingProject()?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteProject()">Excluir</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingProject = signal<Project | null>(null);
  deletingProject = signal<Project | null>(null);
  formName = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getProjects().subscribe({
      next: data => { this.projects.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.toUpperCase().replace(/[^A-Z0-9_/-]/g, '');
    this.formName = clean;
    input.value = clean;
  }

  goToUseCases(project: Project) {
    this.router.navigate(['/projects', project.id, 'use-cases'], { queryParams: { projectId: project.id } });
  }

  openModal(project?: Project) {
    this.editingProject.set(project || null);
    this.formName = project?.name || '';
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.formName = ''; this.editingProject.set(null); }

  save() {
    const name = this.formName.trim();
    if (!name) return;
    const editing = this.editingProject();
    if (editing) {
      this.api.updateProject(editing.id, { name }).subscribe(() => { this.closeModal(); this.load(); });
    } else {
      this.api.createProject({ name }).subscribe(() => { this.closeModal(); this.load(); });
    }
  }

  confirmDelete(project: Project) { this.deletingProject.set(project); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingProject.set(null); }

  deleteProject() {
    const p = this.deletingProject();
    if (!p) return;
    this.api.deleteProject(p.id).subscribe(() => { this.cancelDelete(); this.load(); });
  }
}
