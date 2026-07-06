import { BankPayment, BankReceipt, CashPayment, CashReceipt, Contra, JournalEntry } from "./types";

export const SEED_CASH_PAYMENTS: CashPayment[] = [
  {
    id: "cp-1",
    paymentMode: "manual",
    cashAccount: "cash-account",
    voucherNo: "CP/26-27/055",
    date: "2026-06-11",
    oppAccount: "suraj-sunil-bagave",
    amount: "2000",
    narration: "Cash payment received for vehicle service booking",
    createdAt: "2026-06-11T07:30:00.000Z"
  },
  {
    id: "cp-2",
    paymentMode: "bom",
    cashAccount: "cash-account",
    voucherNo: "CP/26-27/056",
    date: "2026-06-10",
    oppAccount: "suraj-sunil-bagave",
    amount: "5000",
    narration: "Booking advance refund due to lead cancellation",
    createdAt: "2026-06-10T11:15:00.000Z"
  },
  {
    id: "cp-3",
    paymentMode: "manual",
    cashAccount: "cash-account",
    voucherNo: "CP/26-27/057",
    date: "2026-06-09",
    oppAccount: "suraj-sunil-bagave",
    amount: "1500",
    narration: "Payment clear for RTO secondary accessories registration",
    createdAt: "2026-06-09T04:20:00.000Z"
  }
];

export const SEED_BANK_PAYMENTS: BankPayment[] = [
  {
    id: "bp-1",
    paymentMode: "manual",
    bankAccount: "sbi-current",
    voucherNo: "BP/26-27/006",
    date: "2026-06-11",
    oppAccount: "suraj-sunil-bagave",
    amount: "15000",
    transactionMode: "neft",
    narration: "Vendor payment processed for structural parts",
    createdAt: "2026-06-11T10:00:00.000Z"
    
  }];

export const SEED_CASH_RECEIPTS: CashReceipt[] = [
  {
    id: "cr-1",
    receiptMode: "manual",
    cashAccount: "cash-account",
    voucherNo: "CR/26-27/490",
    date: "2026-06-11",
    oppAccount: "suraj-sunil-bagave",
    amount: "8500",
    narration: "Cash receipt advance collected for dynamic workshop delivery",
    createdAt: "2026-06-11T11:45:00.000Z"
  }
];

export const SEED_BANK_RECEIPTS: BankReceipt[] = [
  {
    id: "br-1",
    receiptMode: "manual",
    bankAccount: "sbi-current",
    voucherNo: "BR/26-27/933",
    date: "2026-06-11",
    oppAccount: "suraj-sunil-bagave",
    amount: "45000",
    transactionMode: "neft",
    narration: "Booking collection amount transferred to main bank account",
    createdAt: "2026-06-11T12:20:00.000Z"
  }
];

export const SEED_CONTRAS: Contra[] = [
  {
    id: "cn-1",
    type: "deposit",
    account: "sbi-current",
    voucherNo: "26-27/001",
    date: "2026-06-11",
    oppAccount: "cash-account",
    amount: "25000",
    narration: "Excess retail floor cash deposited to SBI Current Account",
    createdAt: "2026-06-11T13:10:00.000Z"
  }
];
export const SEED_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "jv-1",
    type: "general",
    drAccount: "rto-expenses",
    crAccount: "suraj-sunil-bagave",
    voucherNo: "JV/26-27/082",
    date: "2026-06-11",
    amount: "6500",
    narration: "RTO registration charges adjustment entry generated for vehicle handover",
    createdAt: "2026-06-11T14:05:00.000Z"
  }
];