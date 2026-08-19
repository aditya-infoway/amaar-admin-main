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
  id: string;
  qNo: string;
  leadId: string;

  customerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  model: string;
  remark?: string;

  vehicleType?: "tipper" | "trailer";

  trailer?: number | null;
  chassis?: number | null;
  body?: number | null;
  hydraulic?: number | null;
  axle?: number | null;
  suspension?: number | null;
  tyre?: number | null;
  rim?: number | null;
  kingPin?: number | null;
  landingLeg?: number | null;
  brakeSystem?: number | null;
  mudguard?: number | null;
  color?: number | null;
  electricalTapes?: number | null;
  supdRupd?: number | null;
  box?: number | null;
  spareWheelCarrier?: number | null;

  warranty?: string;

  discountType: "amount" | "percentage";
  discountValue: string;

  basicCost?: string;
  gstAmount?: string;
  finalPrice: string;

  createdBy: string;
  position: string;
  createdAt?: string;
}