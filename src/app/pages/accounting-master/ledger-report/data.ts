import { AccountOption } from "@/components/shared/form/AccountListbox";
import { CashPayment } from "../shared/types";

export type { CashPayment };

// Cash Account options (simple listbox)
export const cashAccountOptions = [
  { id: "cash-account", label: "CASH ACCOUNT" },
];

// Opp Account options (AccountListbox with name, number, balance)
export const oppAccountOptions: AccountOption[] = [
  { id: "acc-1", name: "Kishanbhai",   number: "9913412059", balance: 100000 },
  { id: "acc-2", name: "Rameshbhai",   number: "9876543210", balance: 55000  },
  { id: "acc-3", name: "Sunita Patel", number: "9812345678", balance: 230000 },
];

export const emptyCashPayment = (): CashPayment => ({
  id: "",
  paymentMode: "manual",
  cashAccount: "",
  voucherNo: "CP/26-27/055",
  date: "2026-06-11",
  oppAccount: "",
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});