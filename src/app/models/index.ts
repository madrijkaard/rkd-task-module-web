export interface Project {
  id: number;
  name: string;
  created_date: string;
  last_modified_date: string;
}

export interface ProjectPayload {
  name: string;
}

export interface UseCase {
  id: number;
  name: string;
  specification: string;
  created_date: string;
  last_modified_date: string;
  project_id: number;
}

export interface UseCasePayload {
  name: string;
  specification: string;
  project_id: number;
}

export interface Task {
  id: number;
  name: string;
  sequence: number;
  type: string;
  path: string;
  system_prompt: string;
  user_prompt: string;
  created_date: string;
  last_modified_date: string;
  use_case_id: number;
}

export interface TaskPayload {
  name: string;
  type: string;
  path: string;
  system_prompt: string;
  user_prompt: string;
  use_case_id: number;
}

export interface Iteration {
  id: number;
  created_date: string;
  last_modified_date: string;
  task_id: number;
}

export interface IterationPayload {
  task_id: number;
}

export interface ExecuteTaskPayload {
  model: string;
}
