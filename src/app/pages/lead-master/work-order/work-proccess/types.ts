export type WorkProcessStatus = "Pending" | "Completed";

export interface WorkProcessStep {
  id: number;
  key: string;
  label: string;
  status: WorkProcessStatus;
}

export interface WorkOrderOption {
  id: number;
  workOrderNo: string;
  customerName: string;
  model?: string;
  label: string; // combobox display: "WO-No | Name | Model"
}