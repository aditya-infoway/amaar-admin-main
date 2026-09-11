import type { WorkOrder } from "../shared/types";

export const emptyWorkOrder = (): WorkOrder => ({
  id: "",
  workOrderNo: "",
  salesOrderId: "",
  customerName: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  model: "",
  qty: 1,
  totalPrice: 0,
  gst: 0,
  grandTotal: 0,
});