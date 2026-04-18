# Ralph Loop Module — Frontend Angular

## Pré-requisitos

- **Node.js 22 LTS** (recomendado para produção) — https://nodejs.org
- **Angular CLI 21** (mais recente)

> ⚠️ Node 25 funciona em desenvolvimento mas é versão "odd" (sem suporte LTS).
> Para produção, prefira Node 22 LTS.

---

## 1. Instalar o Angular CLI

```bash
npm install -g @angular/cli
```

Verifique a instalação:
```bash
ng version
# Angular CLI: 21.x.x
```

---

## 2. Instalar dependências do projeto

Na pasta do projeto:
```bash
npm install
```

---

## 3. Rodar em desenvolvimento

Com o backend Rust rodando em `localhost:3000`:

```bash
npm start
```

Acesse: http://localhost:4200

O proxy em `proxy.conf.json` redireciona `/api/*` → `http://localhost:3000/*`.

---

## 4. Build para produção

```bash
npm run build
```

Saída em `dist/ralph-loop-frontend/`.

---

## Estrutura do projeto

```
src/
  app/
    models/         → interfaces TypeScript (Project, UseCase, Task, Iteration)
    services/       → ApiService (chamadas HTTP)
    components/
      projects/     → tela de projetos (CRUD)
      use-cases/    → tela de use cases (CRUD)
      tasks/        → tela de tasks (CRUD)
      iterations/   → tela de iterations (CRUD)
    app.routes.ts   → rotas da aplicação
    app.component.ts → layout com sidebar
  styles.css        → estilos globais
  main.ts           → bootstrap da aplicação
proxy.conf.json     → proxy de dev para o backend
```

---

## Navegação

- `/projects` → lista projetos
- `/projects/:id/use-cases` → use cases do projeto
- `/use-cases/:id/tasks` → tasks do use case
- `/tasks/:id/iterations` → iterations da task

Clique no nome de qualquer item para navegar ao próximo nível.

## Mudanças do Angular 19 → 21

- Builder: `@angular-devkit/build-angular` → `@angular/build`
- TypeScript: ~5.6 → ~5.7
- Todos os pacotes `@angular/*`: ^19 → ^21
