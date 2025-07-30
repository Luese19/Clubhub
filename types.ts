
export type UserRole = 'superadmin' | 'admin' | 'student';

export interface Organization {
  id: string;
  name: string;
  adminEmail: string;
}

export interface User {
  email: string;
  role: UserRole;
  organizationId: string | null;
  name?: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface ClubEvent {
  id: number;
  organizationId: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export enum TaskStatus {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
}

export interface ProjectTask {
  id: number;
  organizationId: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  title: string;
}