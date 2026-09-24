import { CashReceipt } from "../shared/types";

export type { CashReceipt };

export const emptyCashReceipt = (): CashReceipt => ({
  id: "",
  receiptMode: "manual" as any,
  paymentMode:"",
  cashAccount: "",   // ✅ ab dynamic fetch hoga
  voucherNo: "",
  date: "",
  oppAccount: "",     // ✅ ab dynamic fetch hoga
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});