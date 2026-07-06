import { AccountOption } from "@/components/shared/form/AccountListbox";
import { Contra } from "../shared/types";

export type { Contra };

export const emptyContra = (): Contra => ({
  id: "",
  type: "deposit",
  account: "",
  voucherNo: "26-27/001",
  date: "2026-06-11",
  oppAccount: "",
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});

export const accountOptions = [
  { id: "cash-account", label: "CASH ACCOUNT" },
  { id: "sbi-current", label: "SBI CURRENT A/C" },
  { id: "hdfc-current", label: "HDFC CURRENT A/C" },
];


export const oppAccountOptions: AccountOption[] = [
  { id: "acc-1", name: "Suraj Sunil Bagave", number: "9913412059", balance: 100000 },
  { id: "acc-2", name: "Rameshbhai",         number: "9876543210", balance: 55000  },
  { id: "acc-3", name: "Sunita Patel",       number: "9812345678", balance: 230000 },
];