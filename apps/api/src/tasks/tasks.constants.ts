export const TASK_TYPES = [
  'maintenance',
  'pruning',
  'cleaning',
  'installation',
  'inspection',
  'emergency',
] as const;

export type TaskType = (typeof TASK_TYPES)[number];
