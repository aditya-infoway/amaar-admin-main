export type WorkProcessStatus = "Pending" | "Completed";

export interface WorkProcessStep {
  id: number;
  key: string;
  label: string;
  status: WorkProcessStatus;
}

export interface WorkOrderOption {
  id: number;
  workOrderId: string;
  name: string;
  model: string;
}