import { AccountOption } from "@/components/shared/form/AccountListbox";
import { CashReceipt } from "../shared/types";

export type { CashReceipt };

export const emptyCashReceipt = (): CashReceipt => ({
  id: "",
  receiptMode: "manual",
  cashAccount: "",
  voucherNo: "CR/26-27/490",
  date: "2026-06-11",
  oppAccount: "",
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});

export const cashAccountOptions = [
  { id: "cash-account", label: "CASH ACCOUNT" },
];


export const oppAccountOptions: AccountOption[] = [
  { id: "acc-1", name: "Suraj Sunil Bagave", number: "9913412059", balance: 100000 },
  { id: "acc-2", name: "Rameshbhai",         number: "9876543210", balance: 55000  },
  { id: "acc-3", name: "Sunita Patel",       number: "9812345678", balance: 230000 },
];