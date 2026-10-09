export interface SalesRegister {
  id: string;
  salesDate: string;
  terms: string;
  partyName: string;
  salesInvoiceNo: string;
  salesOrderNo?: string;
  location: string;
  totalQuantity: string;
  subTotal: string;
  taxableAmount: string;
  discountAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  grandTotal: string;
  createdBy?: string;
  createdType?: string;
  status: string;
}

export const emptySalesRegister = (): SalesRegister => ({
  id: "",
  salesDate: "",
  terms: "",
  partyName: "",
  salesInvoiceNo: "",
  salesOrderNo: "",
  location: "",
  totalQuantity: "",
  subTotal: "",
  taxableAmount: "",
  discountAmount: "",
  cgstAmount: "",
  sgstAmount: "",
  igstAmount: "",
  grandTotal: "",
  createdBy: "",
  createdType: "",
  status: "",
});