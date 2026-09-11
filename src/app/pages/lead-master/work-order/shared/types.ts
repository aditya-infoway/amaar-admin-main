// src/app/pages/work-order/shared/types.ts

export interface WorkOrder {
  id: string;
  workOrderNo: string;

  salesOrderId: string;

  customerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;

  model: string;
  qty: number;
salesOrderNo?: string;
modelName?: string;
  totalPrice: number;
  gst: number;
  grandTotal: number;
}

export interface Category {
  id: string;
  code: string;
  categoryName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface Model {
  id: string;
  categoryId: string;
  modelCode: string;
  modelName: string;
  axleType: string;
  capacity: string;
  length: string;
  width: string;
  height: string;
  standardWeight: string;
  status: "active" | "inactive";
}

export interface Enquiry {
  id: string;
  leadId: string;
  name: string;
  number: string;
  email: string;
  address: string;
  city: string;
  model: string; // model id
  remark: string;
  nextFollowupDate: string;
  createdBy: string;
  createdType: "Manual" | "Website" | "Import" | string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  qNo: string;
  leadId: string;
  customerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  model: string; // model id
  tyre: string | null;
  axle: string | null;
  hydraulic: string | null;
  box: string | null;
  color: string | null;
  chassis: string | null;
  discountType: "amount" | "percentage";
  discountValue: string;
  finalPrice: string;
  createdBy: string;
  position: string;
  createdAt: string;
  remark?: string;
}