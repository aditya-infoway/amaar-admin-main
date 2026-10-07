import { PurchaseRegister } from "../purchase-register/data";
import { SEED_PURCHASE_REGISTERS } from "./seedData";

const SEED_VERSION = "1";

const KEYS = {
  purchaseRegisters: "amaar_purchase_registers",
  seedVersion: "amaar_purchase_registers_seed_version",
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

  write(KEYS.purchaseRegisters, SEED_PURCHASE_REGISTERS);
  window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

export const purchaseRegisterStorage = {
  getPurchaseRegisters: () => {
    ensureAllSeeded();
    return read<PurchaseRegister>(KEYS.purchaseRegisters);
  },
  savePurchaseRegisters: (data: PurchaseRegister[]) =>
    write(KEYS.purchaseRegisters, data),

  resetToSeedData: () => {
    write(KEYS.purchaseRegisters, SEED_PURCHASE_REGISTERS);
    window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
  },
};