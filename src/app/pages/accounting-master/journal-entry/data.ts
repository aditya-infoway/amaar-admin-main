import { JournalEntry } from "../shared/types";

export type { JournalEntry };

export const emptyJournalEntry = (): JournalEntry => ({
  id: "",
  type: "general",
  drAccount: "",
  crAccount: "",
  voucherNo: "JV/26-27/082",
  date: "2026-06-11",
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});

export const accountOptions = [
  { id: "suraj-sunil-bagave", label: "Suraj Sunil Bagave" },
  { id: "rto-expenses", label: "RTO Expenses A/C" },
  { id: "insurance-expenses", label: "Insurance Expenses A/C" },
  { id: "cgst-input", label: "CGST Input Tax A/C" },
  { id: "sgst-input", label: "SGST Input Tax A/C" },
  { id: "vehicles-inventory", label: "Vehicles Inventory A/C" },
];