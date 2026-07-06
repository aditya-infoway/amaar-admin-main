import { Category, Enquiry, Model, Quotation } from "./types";
import {
  SEED_CATEGORIES,
  SEED_ENQUIRIES,
  SEED_MODELS,
  SEED_QUOTATIONS,
} from "./seedData";

const SEED_VERSION = "15";

const KEYS = {
  seedVersion: "amaar_master_seed_version",
  categories: "amaar_master_categories",
  models: "amaar_master_models",
  enquiries: "amaar_master_enquiries",
  quotations: "amaar_master_quotations",
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

  write(KEYS.categories, SEED_CATEGORIES);
  write(KEYS.models, SEED_MODELS);
  write(KEYS.enquiries, SEED_ENQUIRIES);
  write(KEYS.quotations, SEED_QUOTATIONS);

  window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

export const masterStorage = {
  getCategories: () => {
    ensureAllSeeded();
    return read<Category>(KEYS.categories);
  },
  saveCategories: (data: Category[]) => write(KEYS.categories, data),

  getModels: () => {
    ensureAllSeeded();
    return read<Model>(KEYS.models);
  },
  saveModels: (data: Model[]) => write(KEYS.models, data),

  getEnquiries: () => {
    ensureAllSeeded();
    return read<Enquiry>(KEYS.enquiries);
  },
  saveEnquiries: (data: Enquiry[]) => write(KEYS.enquiries, data),

  getQuotations: () => {
    ensureAllSeeded();
    return read<Quotation>(KEYS.quotations);
  },
  saveQuotations: (data: Quotation[]) => write(KEYS.quotations, data),

  resetToSeedData: () => {
    write(KEYS.categories, SEED_CATEGORIES);
    write(KEYS.models, SEED_MODELS);
    write(KEYS.enquiries, SEED_ENQUIRIES);
    write(KEYS.quotations, SEED_QUOTATIONS);
    window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
  },
};

export function getCategoryLabel(
  categories: Category[],
  categoryId: string,
): string {
  return (
    categories.find((item) => item.id === categoryId)?.categoryName || "—"
  );
}

export function getModelLabel(models: Model[], modelId: string): string {
  return models.find((item) => item.id === modelId)?.modelName || "—";
}