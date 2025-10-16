
export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export interface ValveJob {
  id: string;
  valveId: string;
  description: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
}

export interface ValveJobInput {
  valveId: string;
  description: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  estimatedCompletion?: Date;
}
