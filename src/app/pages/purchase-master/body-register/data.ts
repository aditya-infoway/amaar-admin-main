// src/pages/body-register/data.ts

export type VehicleType = "Tipper" | "Trailer";
export type TabKey = "pending" | "generate";

const formatDate = (value: any): string => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
};

const normalizeType = (value: any): VehicleType => {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (v === "tipper") return "Tipper";
  if (v === "trailer") return "Trailer";
  return "" as VehicleType;
};

export interface BodyRegisterData {
  bodyRegisterId: number;
  vehicleType?: string;
  classOfVehicle?: string;
  makerName?: string;
  bodyNumber?: string;
  serialNo?: number;
  bodyYear?: number;
  engineNo?: string;
  noOfCylinder?: string;
  fuelUsed?: string;
  mfgMonthYear?: string;
  bodyColour?: string;
  grossVehicleWeight?: string;
  typeOfBody?: string;
}

export interface WorkOrderRow {
  id: number;
  workOrderDate: string;
  workOrderNo: string;
  partyName: string;
  number: string;
  city: string;
  model: string;
  type: VehicleType;
  bodyRegisterGenerated: boolean;
  bodyRegisterId: number | null;
  bodyRegister: BodyRegisterData | null;
}

export const mapApiWorkOrderToWorkOrder = (raw: any): WorkOrderRow => ({
  id: Number(raw.id ?? raw.workOrderId ?? 0),
  workOrderDate: formatDate(raw.createdAt),
  workOrderNo: raw.workOrderNo ?? "",
  partyName: raw.customerName ?? "",
  number: raw.mobile ?? "",
  city: raw.city ?? "",
  model: raw.modelName ?? "",
  type: normalizeType(raw.vehicleType),
  bodyRegisterGenerated: Boolean(raw.bodyRegisterGenerated),
  bodyRegisterId: raw.bodyRegisterId ?? null,
  bodyRegister: raw.bodyRegister ?? null,
});
