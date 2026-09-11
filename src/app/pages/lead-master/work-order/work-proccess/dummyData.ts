import type { WorkOrderOption, WorkProcessStep } from "./types";

// TODO: replace with API call -> GET /api/work-order (dropdown list)
export const dummyWorkOrders: WorkOrderOption[] = [
  { id: 1, workOrderId: "WO-1001", name: "Ramesh Patel", model: "Tractor X200" },
  { id: 2, workOrderId: "WO-1002", name: "Suresh Shah", model: "Tractor T450" },
  { id: 3, workOrderId: "WO-1003", name: "Amit Verma", model: "Trolley V3" },
];

// TODO: replace with API call -> GET /api/work-order/:id/process (existing saved status)
export const defaultProcessSteps: WorkProcessStep[] = [
  { id: 1, key: "material_availability", label: "Material Availability", status: "Pending" },
  { id: 2, key: "material_cutting", label: "Material Cutting (C-Sheet)", status: "Pending" },
  { id: 3, key: "welding", label: "Welding", status: "Pending" },
  { id: 4, key: "blasting", label: "Blasting", status: "Pending" },
  { id: 5, key: "paint", label: "Paint", status: "Pending" },
  { id: 6, key: "qc", label: "QC", status: "Pending" },
  { id: 7, key: "ready_for_dispatch", label: "Ready For Dispatch", status: "Pending" },
];