import type { WorkOrder } from "../shared/types";

export const emptyWorkOrder = (): WorkOrder => ({
  id: "",
  workOrderNo: "",
  salesOrderId: "",
  salesOrderNo: "",
  customerName: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  model: "",
  modelName: "",
  qty: 1,
  totalPrice: 0,
  gst: 0,
  grandTotal: 0,
});