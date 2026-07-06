export interface PurchaseRegister {
  id: string;
  purchaseDate: string;
  terms: string;
  supplierName: string;
  billNo: string;
  purchaseBillNo: string;
  location: string;
  totalQuantity: string;
  totalAmount: string;
  freightInsuranceOtherCharges: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  grandTotal: string;
  transportName: string;
  mobileNo: string;
  vehicleNo: string;
  status: string;
}

export const emptyPurchaseRegister = (): PurchaseRegister => ({
  id: "",
  purchaseDate: "",
  terms: "",
  supplierName: "",
  billNo: "",
  purchaseBillNo: "",
  location: "",
  totalQuantity: "",
  totalAmount: "",
  freightInsuranceOtherCharges: "",
  cgstAmount: "",
  sgstAmount: "",
  igstAmount: "",
  grandTotal: "",
  transportName: "",
  mobileNo: "",
  vehicleNo: "",
  status: "",
});