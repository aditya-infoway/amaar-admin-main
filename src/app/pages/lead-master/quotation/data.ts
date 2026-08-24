import type { Quotation } from "../shared/types";

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
  remark: "",

  vehicleType: "trailer",

  trailer: null,
  chassis: null,
  body: null,
  hydraulic: null,
  axle: null,
  suspension: null,
  tyre: null,
  rim: null,
  kingPin: null,
  landingLeg: null,
  brakeSystem: null,
  mudguard: null,
  color: null,
  electricalTapes: null,
  supdRupd: null,
  box: null,
  spareWheelCarrier: null,

  warranty: "",

  discountType: "amount",
  discountValue: "0",

  basicCost: "0",
  gstAmount: "0",
  finalPrice: "0",

  createdBy: "Admin",
  position: "",
  createdAt: new Date().toISOString(),
});