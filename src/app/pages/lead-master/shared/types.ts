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
  model: string;
  remark: string;
  nextFollowupDate: string;
  createdBy: string;
  createdType: string;
  createdAt: string;
}

export interface Quotation {
  remark: any;
  id: string;
  qNo: string;
  leadId: string;
  customerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  model: string;
  tyre: string;
  axle: string;
  hydraulic: string;
  box: string;
  color: string;
  chassis: string;
  markup: string;
  discountType: "amount" | "percentage";
  discountValue: string;
  finalPrice: string;
  createdBy: string;
  position: string;
  createdAt: string;
}