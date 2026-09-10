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

  totalPrice: number;
  gst: number;
  grandTotal: number;
}