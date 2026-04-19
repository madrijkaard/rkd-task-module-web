import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Iteration } from '../../models';

@Component({
  selector: 'app-iterations',
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
            <a [routerLink]="['/use-cases', useCaseId(), 'tasks']"
               [queryParams]="{ useCaseId: useCaseId(), projectId: projectId() }">Casos de Uso</a>
            <span>›</span>
            <span>Tarefas</span>
          </div>
          <h1>Iterações</h1>
        </div>

        <!-- Combo modelo + botão Executar Tarefa -->
        <div style="display:flex;align-items:center;gap:8px">
          @if (modelsLoading()) {
            <div style="font-size:13px;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Carregando modelos...
            </div>
          } @else if (modelsError()) {
            <button class="btn btn-ghost btn-sm" (click)="loadModels()" title="Recarregar modelos">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>
              Recarregar modelos
            </button>
          } @else {
            <div class="form-group" style="margin:0;flex-direction:row;align-items:center;gap:8px">
              <label style="white-space:nowrap;margin:0;text-transform:none;font-size:13px;font-weight:500;color:var(--text-muted);letter-spacing:0">Modelo</label>
              <select class="form-control" [(ngModel)]="selectedModel" style="min-width:220px">
                <option value="" disabled>Selecione o modelo...</option>
                @for (m of engineModels(); track m) {
                  <option [value]="m">{{ m }}</option>
                }
              </select>
            </div>
          }

          <button class="btn btn-primary" (click)="execute()"
            [disabled]="!selectedModel || modelsLoading() || modelsError()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Executar Tarefa
          </button>
        </div>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="loading">Carregando iterações...</div>
        } @else if (iterations().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <p>Nenhuma iteração encontrada. Execute a tarefa para criar!</p>
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

    <!-- ══ PROCESSING MODAL ══ -->
    @if (showProcessing()) {
      <div class="modal-backdrop">
        <div class="modal" style="max-width:400px;text-align:center">
          <div class="modal-body" style="padding:40px 32px;align-items:center">

            @if (processStatus() === 'running') {
              <!-- Spinner animado -->
              <div style="position:relative;width:72px;height:72px;margin:0 auto 24px">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style="position:absolute;top:0;left:0;animation:spin 1.2s linear infinite">
                  <circle cx="36" cy="36" r="30" stroke="var(--primary)" stroke-width="5" stroke-linecap="round"
                    stroke-dasharray="120 60" />
                </svg>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style="position:absolute;top:0;left:0;opacity:0.15">
                  <circle cx="36" cy="36" r="30" stroke="var(--primary)" stroke-width="5"/>
                </svg>
              </div>
              <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text)">Processando...</h2>
              <p style="font-size:13px;color:var(--text-muted)">
                Executando a tarefa com o modelo<br>
                <strong style="color:var(--text)">{{ selectedModel }}</strong>
              </p>
              <p style="font-size:12px;color:var(--text-muted);margin-top:12px">Isso pode levar alguns instantes.</p>
            }

            @if (processStatus() === 'ok') {
              <!-- Sucesso -->
              <div style="width:72px;height:72px;border-radius:50%;background:var(--success-light);display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text)">Concluído!</h2>
              <p style="font-size:13px;color:var(--text-muted)">A tarefa foi executada com sucesso.<br>Uma nova iteração foi registrada.</p>
            }

            @if (processStatus() === 'error') {
              <!-- Erro -->
              <div style="width:72px;height:72px;border-radius:50%;background:var(--danger-light);display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text)">Falha na execução</h2>
              <p style="font-size:13px;color:var(--text-muted)">{{ processErrorMsg() }}</p>
            }

          </div>

          @if (processStatus() !== 'running') {
            <div class="modal-footer" style="justify-content:center;border-top:1px solid var(--border)">
              <button class="btn btn-primary" (click)="closeProcessing()">Fechar</button>
            </div>
          }
        </div>
      </div>
    }

    <!-- ══ DELETE CONFIRM MODAL ══ -->
    @if (showDeleteConfirm()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Excluir Iteração</h2>
            <button class="btn-close" (click)="cancelDelete()">&#x2715;</button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a iteração <strong>#{{ deletingIt()?.id }}</strong>?</p>
            @if (deleteError()) {
              <div style="margin-top:12px;padding:10px 14px;background:var(--danger-light);border:1px solid #FECACA;border-radius:var(--radius);color:var(--danger);font-size:13px">
                {{ deleteError() }}
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="cancelDelete()">{{ deleteError() ? 'Fechar' : 'Cancelar' }}</button>
            @if (!deleteError()) {
              <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger)" (click)="deleteIt()">Excluir</button>
            }
          </div>
        </div>
      </div>
    }

    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `
})
export class IterationsComponent implements OnInit {
  iterations = signal<Iteration[]>([]);
  engineModels = signal<string[]>([]);
  loading = signal(true);
  modelsLoading = signal(false);
  modelsError = signal(false);
  showProcessing = signal(false);
  showDeleteConfirm = signal(false);
  deletingIt = signal<Iteration | null>(null);
  deleteError = signal('');
  processStatus = signal<'running' | 'ok' | 'error'>('running');
  processErrorMsg = signal('');
  taskId = signal(0);
  useCaseId = signal(0);
  projectId = signal(0);
  selectedModel = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('taskId'));
    this.taskId.set(id);
    const qp = this.route.snapshot.queryParamMap;
    this.useCaseId.set(Number(qp.get('useCaseId')) || 0);
    this.projectId.set(Number(qp.get('projectId')) || 0);
    this.load();
    this.loadModels();
  }

  load() {
    this.loading.set(true);
    this.api.getIterationsByTask(this.taskId()).subscribe({
      next: data => { this.iterations.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadModels() {
    this.modelsLoading.set(true);
    this.modelsError.set(false);
    this.api.getEngineModels().subscribe({
      next: data => { this.engineModels.set(data); this.modelsLoading.set(false); },
      error: () => { this.modelsError.set(true); this.modelsLoading.set(false); }
    });
  }

  execute() {
    if (!this.selectedModel) return;
    this.processStatus.set('running');
    this.processErrorMsg.set('');
    this.showProcessing.set(true);

    this.api.executeTask(this.taskId(), { model: this.selectedModel }).subscribe({
      next: () => {
        this.processStatus.set('ok');
      },
      error: (err) => {
        this.processStatus.set('error');
        const msg = err?.error?.message;
        this.processErrorMsg.set(msg || 'Não foi possível concluir a execução. Tente novamente.');
      }
    });
  }

  closeProcessing() {
    this.showProcessing.set(false);
    if (this.processStatus() === 'ok') {
      this.load(); // recarrega a lista de iterações
    }
  }

  confirmDelete(it: Iteration) { this.deletingIt.set(it); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.showDeleteConfirm.set(false); this.deletingIt.set(null); this.deleteError.set(''); }

  deleteIt() {
    const it = this.deletingIt();
    if (!it) return;
    this.api.deleteIteration(it.id).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: (err) => this.deleteError.set(err?.error?.message || 'Erro ao excluir. Tente novamente.')
    });
  }
}
