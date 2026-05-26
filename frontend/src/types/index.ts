export type Role = 'admin' | 'manager' | 'worker';

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type TaskStatus = 'backlog' | 'todo' | 'research' | 'in_progress' | 'code_review' | 'review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  avatar_color?: string;
  department?: string;
  created_at?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  color?: string;
  deadline?: string;
  manager_id: number;
  manager?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  tasks?: Task[];
  _count?: { tasks: number };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'standard' | 'research' | 'testing' | 'planning';
  status: 'backlog' | 'todo' | 'research' | 'in_progress' | 'code_review' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  project_id: number;
  project?: Pick<Project, 'id' | 'title' | 'color'>;
  assignee_id?: number;
  assignee?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  reviewer_id?: number;
  reviewer?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  tester_id?: number;
  tester?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  reporter_id: number;
  reporter?: Pick<User, 'id' | 'full_name' | 'email'>;
  parent_id?: number | null;
  parent?: Task;
  subtasks?: Task[];
  comments?: Comment[];
  _count?: { comments: number; subtasks: number };
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  author_id: number;
  author?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}