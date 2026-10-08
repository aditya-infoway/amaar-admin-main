export type WorkProcessStatus = "Pending" | "In Progress" | "Completed";

export interface WorkProcessStage {
  stage: string;
  label: string;
  order: number;
  employeeId: string;
  employeeName: string;
  employeeMobile  ?: string;
  status: WorkProcessStatus;
  assignedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
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
}