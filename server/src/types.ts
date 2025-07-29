import { Request } from 'express';

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  admin_email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Announcement {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClubEvent {
  id: string;
  organization_id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export enum TaskStatus {
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
}

export interface ProjectTask {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Resource {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string | null;
  };
}
