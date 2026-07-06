import { Quotation } from "../shared/types";

export type { Quotation };

export const emptyQuotation = (): Quotation => ({
  id: "",
  qNo: `QT${Date.now().toString().slice(-6)}`,
  leadId: "",
  customerName: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  model: "",
  tyre: "",
  axle: "",
  hydraulic: "",
  box: "",
  color: "",
  chassis: "",
  markup: "0",
  discountType: "amount",
  discountValue: "0",
  finalPrice: "0",
  createdBy: "Admin",
  position: "",
  createdAt: new Date().toISOString(),
  remark: undefined
});