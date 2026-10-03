import { BankPayment, BankReceipt, CashPayment, CashReceipt, Contra, JournalEntry } from "../shared/types";
import {
  SEED_BANK_PAYMENTS,
  SEED_BANK_RECEIPTS,
  SEED_CASH_PAYMENTS,
  SEED_CASH_RECEIPTS,
  SEED_CONTRAS,
  SEED_JOURNAL_ENTRIES,
} from "./seedData";

const SEED_VERSION = "15";

const KEYS = {
  bankPayments: "amaar_master_bank_payments",
  bankReceipts: "amaar_master_bank_receipts",
  cashPayments: "amaar_master_cash_payments",
  cashReceipts: "amaar_master_cash_receipts",
  contras: "amaar_master_contras",
  journalEntries: "amaar_master_journal_entries",
  seedVersion: "amaar_master_seed_version",
} as const;

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new StorageEvent("local-storage", { key }));
}

function ensureAllSeeded(): void {
  const currentVersion = window.localStorage.getItem(KEYS.seedVersion);
  if (currentVersion === SEED_VERSION) return;

  write(KEYS.bankPayments, SEED_BANK_PAYMENTS);
  write(KEYS.bankReceipts, SEED_BANK_RECEIPTS);
  write(KEYS.cashPayments, SEED_CASH_PAYMENTS);
  write(KEYS.cashReceipts, SEED_CASH_RECEIPTS);
  write(KEYS.contras, SEED_CONTRAS);
  write(KEYS.journalEntries, SEED_JOURNAL_ENTRIES);
  window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

export const masterStorage = {
  getBankPayments: () => {
    ensureAllSeeded();
    return read<BankPayment>(KEYS.bankPayments);
  },
  saveBankPayments: (data: BankPayment[]) => write(KEYS.bankPayments, data),

  getBankReceipts: () => {
    ensureAllSeeded();
    return read<BankReceipt>(KEYS.bankReceipts);
  },
  saveBankReceipts: (data: BankReceipt[]) => write(KEYS.bankReceipts, data),

  getCashPayments: () => {
    ensureAllSeeded();
    return read<CashPayment>(KEYS.cashPayments);
  },
  saveCashPayments: (data: CashPayment[]) => write(KEYS.cashPayments, data),

  getCashReceipts: () => {
    ensureAllSeeded();
    return read<CashReceipt>(KEYS.cashReceipts);
  },
  saveCashReceipts: (data: CashReceipt[]) => write(KEYS.cashReceipts, data),

  getContras: () => {
    ensureAllSeeded();
    return read<Contra>(KEYS.contras);
  },
  saveContras: (data: Contra[]) => write(KEYS.contras, data),

  getJournalEntries: () => {
    ensureAllSeeded();
    return read<JournalEntry>(KEYS.journalEntries);
  },
  saveJournalEntries: (data: JournalEntry[]) => write(KEYS.journalEntries, data),

  resetToSeedData: () => {
    write(KEYS.bankPayments, SEED_BANK_PAYMENTS);
    write(KEYS.bankReceipts, SEED_BANK_RECEIPTS);
    write(KEYS.cashPayments, SEED_CASH_PAYMENTS);
    write(KEYS.cashReceipts, SEED_CASH_RECEIPTS);
    write(KEYS.contras, SEED_CONTRAS);
    write(KEYS.journalEntries, SEED_JOURNAL_ENTRIES);
    window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
  },
};