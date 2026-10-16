export type WorkProcessStatus = "Pending" | "In Progress" | "Completed";

// Ek process ki ek sub-process (Cutting 1, Cutting 2 ...)
export interface WorkProcessSubStage {
  id: number;
  subProcessId?: number | null;
  label: string;
  status: WorkProcessStatus;
  employeeName?: string;
  employeeMobile?: string;
  assignedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface WorkProcessStage {
  stage: string;
  label: string;
  order: number;
  employeeId: string;
  employeeName: string;
  employeeMobile?: string;
  status: WorkProcessStatus;
  assignedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;

  // NEW: sub-process wale process ke liye (backend: getProcessStageMap)
  hasSubProcess?: boolean;
  completedCount?: number;
  totalCount?: number;
  subStages?: WorkProcessSubStage[];
}

export interface WorkProcessStep {
  id: number;
  key: string;
  label: string;
  status: WorkProcessStatus;
  stage?: WorkProcessStage | null;
}

export interface WorkOrderOption {
  id: number;
  workOrderNo: string;
  customerName: string;
  model?: string;
  label: string;
  stages: WorkProcessStage[];
  processStages?: WorkProcessStage[];
}