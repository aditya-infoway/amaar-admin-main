import type { WorkProcessStep } from "./types";

// TODO: replace with API call -> GET /api/workorder/:id/process (existing saved status)
export const defaultProcessSteps: WorkProcessStep[] = [
  { id: 1, key: "material_availability", label: "Material Availability", status: "Pending" },
  { id: 2, key: "material_cutting", label: "Material Cutting (C-Sheet)", status: "Pending" },
  { id: 3, key: "welding", label: "Welding", status: "Pending" },
  { id: 4, key: "blasting", label: "Blasting", status: "Pending" },
  { id: 5, key: "paint", label: "Paint", status: "Pending" },
  { id: 6, key: "qc", label: "QC", status: "Pending" },
  { id: 7, key: "ready_for_dispatch", label: "Ready For Dispatch", status: "Pending" },
];