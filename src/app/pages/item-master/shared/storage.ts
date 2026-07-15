import {
  Banker,
  Category,
  EnquirySource,
  EnquiryStatus,
  Finance,
  ItemMaster,
  Model,
  ProductSeries,
  Profession,
  Variant,
  VariantStructure,
} from "./types";
import {
  SEED_BANKERS,
  SEED_CATEGORIES,
  SEED_ENQUIRY_SOURCES,
  SEED_ENQUIRY_STATUSES,
  SEED_FINANCES,
  SEED_ITEMS,
  SEED_MODELS,
  SEED_PRODUCT_SERIES,
  SEED_PROFESSIONS,
  SEED_VARIANTS,
  SEED_VARIANT_STRUCTURES,
} from "./seedData";

const SEED_VERSION = "9";

const KEYS = {
  categories: "amaar_master_categories",
  enquirySources: "amaar_master_enquiry_sources",
  productSeries: "amaar_master_product_series",
  models: "amaar_master_models",
  variants: "amaar_master_variants",
  variantStructures: "amaar_master_variant_structures",
  items: "amaar_master_items",
  seedVersion: "amaar_master_seed_version",
  professions: "amaar_master_professions",
  enquiryStatuses: "amaar_master_enquiry_statuses",
  bankers: "amaar_master_bankers",
  finances: "amaar_master_finances",


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
  write(KEYS.enquirySources, SEED_ENQUIRY_SOURCES);
  write(KEYS.productSeries, SEED_PRODUCT_SERIES);
  write(KEYS.models, SEED_MODELS);
  write(KEYS.variants, SEED_VARIANTS);
  write(KEYS.variantStructures, SEED_VARIANT_STRUCTURES);
  write(KEYS.items, SEED_ITEMS);
  write(KEYS.professions, SEED_PROFESSIONS);
  write(KEYS.enquiryStatuses, SEED_ENQUIRY_STATUSES);
  write(KEYS.bankers, SEED_BANKERS);
  write(KEYS.finances, SEED_FINANCES);

  window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

export const masterStorage = {
  getCategories: () => {
    ensureAllSeeded();
    return read<Category>(KEYS.categories);
  },
  saveCategories: (data: Category[]) => write(KEYS.categories, data),

  getProfessions: () => {
    ensureAllSeeded();
    return read<Profession>(KEYS.professions);
  },
  saveProfessions: (data: Profession[]) => write(KEYS.professions, data),

  getEnquiryStatuses: () => {
    ensureAllSeeded();
    return read<EnquiryStatus>(KEYS.enquiryStatuses);
  },
  getBankers: () => {
    ensureAllSeeded();
    return read<Banker>(KEYS.bankers);
  },
  saveBankers: (data: Banker[]) => write(KEYS.bankers, data),
  saveEnquiryStatuses: (data: EnquiryStatus[]) =>
    write(KEYS.enquiryStatuses, data),

  getFinances: () => {
    ensureAllSeeded();
    return read<Finance>(KEYS.finances);
  },
  saveFinances: (data: Finance[]) => write(KEYS.finances, data),

  getEnquirySources: () => {
    ensureAllSeeded();
    return read<EnquirySource>(KEYS.enquirySources);
  },
  saveEnquirySources: (data: EnquirySource[]) =>
    write(KEYS.enquirySources, data),

  getProductSeries: () => {
    ensureAllSeeded();
    return read<ProductSeries>(KEYS.productSeries);
  },
  saveProductSeries: (data: ProductSeries[]) =>
    write(KEYS.productSeries, data),

  getModels: () => {
    ensureAllSeeded();
    return read<Model>(KEYS.models);
  },
  saveModels: (data: Model[]) => write(KEYS.models, data),

  getVariants: () => {
    ensureAllSeeded();
    return read<Variant>(KEYS.variants);
  },
  saveVariants: (data: Variant[]) => write(KEYS.variants, data),

  getVariantStructures: () => {
    ensureAllSeeded();
    return read<VariantStructure>(KEYS.variantStructures);
  },
  saveVariantStructures: (data: VariantStructure[]) =>
    write(KEYS.variantStructures, data),

  getItems: () => {
    ensureAllSeeded();
    return read<ItemMaster>(KEYS.items);
  },
  saveItems: (data: ItemMaster[]) => write(KEYS.items, data),

  resetToSeedData: () => {
    write(KEYS.categories, SEED_CATEGORIES);
    write(KEYS.enquirySources, SEED_ENQUIRY_SOURCES);
    write(KEYS.productSeries, SEED_PRODUCT_SERIES);
    write(KEYS.models, SEED_MODELS);
    write(KEYS.variants, SEED_VARIANTS);
    write(KEYS.variantStructures, SEED_VARIANT_STRUCTURES);
    write(KEYS.items, SEED_ITEMS);
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

export function getSeriesLabel(
  series: ProductSeries[],
  seriesId: string,
): string {
  return series.find((item) => item.id === seriesId)?.seriesName || "—";
}

export function getModelLabel(models: Model[], modelId: string): string {
  return models.find((item) => item.id === modelId)?.modelName || "—";
}