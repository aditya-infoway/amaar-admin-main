import {
  Category,
  ItemMaster,
  Model,
  ProductSeries,
  Variant,
  VariantStructure,
} from "./types";
import {
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_MODELS,
  SEED_PRODUCT_SERIES,
  SEED_VARIANTS,
  SEED_VARIANT_STRUCTURES,
} from "./seedData";

const SEED_VERSION = "3";

const KEYS = {
  categories: "amaar_master_categories",
  productSeries: "amaar_master_product_series",
  models: "amaar_master_models",
  variants: "amaar_master_variants",
  variantStructures: "amaar_master_variant_structures",
  items: "amaar_master_items",
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

  write(KEYS.categories, SEED_CATEGORIES);
  write(KEYS.productSeries, SEED_PRODUCT_SERIES);
  write(KEYS.models, SEED_MODELS);
  write(KEYS.variants, SEED_VARIANTS);
  write(KEYS.variantStructures, SEED_VARIANT_STRUCTURES);
  write(KEYS.items, SEED_ITEMS);
  window.localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

export const masterStorage = {
  getCategories: () => {
    ensureAllSeeded();
    return read<Category>(KEYS.categories);
  },
  saveCategories: (data: Category[]) => write(KEYS.categories, data),

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
