
import { ValveJob } from '@/types/ValveJob';

export const generateMockJobs = (): ValveJob[] => {
  const now = new Date();
  const jobs: ValveJob[] = [
    {
      id: '1',
      valveId: 'VLV-001',
      description: 'Replace valve seat and stem',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'John Smith',
      notes: 'Customer requested expedited service',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      estimatedCompletion: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      valveId: 'VLV-002',
      description: 'Pressure test and recalibration',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Sarah Johnson',
      notes: 'Waiting for parts delivery',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      valveId: 'VLV-003',
      description: 'Complete overhaul and inspection',
      status: 'completed',
      priority: 'low',
      assignedTo: 'Mike Davis',
      notes: 'All tests passed successfully',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      estimatedCompletion: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      id: '4',
      valveId: 'VLV-004',
      description: 'Leak repair and seal replacement',
      status: 'on-hold',
      priority: 'high',
      assignedTo: 'Emily Brown',
      notes: 'Awaiting customer approval for additional work',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      valveId: 'VLV-005',
      description: 'Routine maintenance check',
      status: 'pending',
      priority: 'low',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      estimatedCompletion: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
  ];
  return jobs;
};
