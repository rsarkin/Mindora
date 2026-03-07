export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskCategory = 'mental' | 'physical' | 'behavioral' | 'social';
export type TaskSource = 'ai' | 'manual';
export type TaskFrequency = 'once' | 'daily' | 'weekly';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface WellnessTask {
  _id: string;
  patientId: string;
  sourceDescriptionId?: string;
  source: TaskSource;
  status: TaskStatus;
  category: TaskCategory;
  title: string;
  description?: string;
  durationMinutes?: number;
  frequency: TaskFrequency;
  dueDate?: string;
  completedAt?: string;
  approvalStatus: ApprovalStatus;
  therapistNote?: string;
  createdAt: string;
}

export interface ProblemDescription {
  _id: string;
  patientId: string;
  content: string;
  version: number;
  crisisFlag: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  byCategory: Record<TaskCategory, number>;
}
