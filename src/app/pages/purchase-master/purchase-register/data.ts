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
  transportLoadingOtherCharge: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  grandTotal: string;
   createdBy?: string; 
  createdType?:string;
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
  transportLoadingOtherCharge: "",
  cgstAmount: "",
  sgstAmount: "",
  igstAmount: "",
  grandTotal: "",
   createdBy: "",
  createdType:"",
  status: "",
});