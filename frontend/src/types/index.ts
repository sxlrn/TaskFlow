export type Role = 'admin' | 'manager' | 'worker';

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
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
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  estimated_hours?: number;
  project_id: number;
  project?: Pick<Project, 'id' | 'title' | 'color'>;
  assignee_id?: number;
  assignee?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_color'>;
  reporter_id: number;
  reporter?: Pick<User, 'id' | 'full_name' | 'email'>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}