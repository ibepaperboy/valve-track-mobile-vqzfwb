
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
  percentComplete: number; // 0-100
}

export interface ValveJobInput {
  valveId: string;
  description: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  estimatedCompletion?: Date;
  percentComplete?: number;
}

// Helper function to get status label from percent complete
export function getStatusFromPercent(percent: number): string {
  if (percent >= 100) return 'Shipped';
  if (percent >= 95) return 'Preparing for Shipment';
  if (percent >= 80) return 'Final Testing';
  if (percent >= 70) return 'Assembly';
  if (percent >= 65) return 'ON-HOLD';
  if (percent >= 60) return 'Waiting on Parts';
  if (percent >= 40) return 'Advised Cost/HOLD';
  if (percent >= 30) return 'Evaluation';
  if (percent >= 20) return 'Teardown';
  if (percent >= 15) return 'Pre-Test';
  if (percent >= 10) return 'Received';
  return 'Planned';
}

// Helper function to get color based on percent complete
export function getColorFromPercent(percent: number): string {
  if (percent >= 100) return '#10b981'; // green - Shipped
  if (percent >= 95) return '#3b82f6'; // blue - Preparing for Shipment
  if (percent >= 80) return '#3b82f6'; // blue - Final Testing
  if (percent >= 70) return '#3b82f6'; // blue - Assembly
  if (percent >= 65) return '#ef4444'; // red - ON-HOLD
  if (percent >= 60) return '#f59e0b'; // orange - Waiting on Parts
  if (percent >= 40) return '#f59e0b'; // orange - Advised Cost/HOLD
  if (percent >= 30) return '#8b5cf6'; // purple - Evaluation
  if (percent >= 20) return '#8b5cf6'; // purple - Teardown
  if (percent >= 15) return '#8b5cf6'; // purple - Pre-Test
  if (percent >= 10) return '#6366f1'; // indigo - Received
  return '#6b7280'; // gray - Planned
}
