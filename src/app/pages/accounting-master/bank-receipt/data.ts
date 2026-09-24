import { BankReceipt } from "../shared/types";

export type { BankReceipt };

export const emptyBankReceipt = (): BankReceipt => ({
  id: "",
  receiptMode: "manual",
  bankAccount: "",
  voucherNo: "",
  date: "",
  oppAccount: "",
  amount: "",
  transactionMode: "upi",
  narration: "",
  createdAt: new Date().toISOString(),
});