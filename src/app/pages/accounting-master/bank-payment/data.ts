import { AccountOption } from "@/components/shared/form/AccountListbox";
import { BankPayment } from "../shared/types";

export type { BankPayment };

export const emptyBankPayment = (): BankPayment => ({
  id: "",
  paymentMode: "manual",
  bankAccount: "",
  voucherNo: "BP/26-27/006",
  date: "2026-06-11",
  oppAccount: "",
  amount: "",
  transactionMode: "neft",
  narration: "",
  createdAt: new Date().toISOString(),
});

export const bankAccountOptions = [
  { id: "sbi-current", label: "SBI CURRENT A/C" },
  { id: "hdfc-current", label: "HDFC CURRENT A/C" },
];

export const oppAccountOptions: AccountOption[] = [
  { id: "acc-1", name: "Suraj Sunil Bagave", number: "9913412059", balance: 100000 },
  { id: "acc-2", name: "Rameshbhai",         number: "9876543210", balance: 55000  },
  { id: "acc-3", name: "Sunita Patel",       number: "9812345678", balance: 230000 },
];