export interface Variant {
  id: string;
  categoryId: string;
  seriesId: string;
  modelId: string;
  variantCode: string;
  variantName: string;
  bodyTypeId: string;
  axleBrandId: string;
  hydraulicBrandId: string;
  tyreBrandId: string;
  targetCost: string;
  sellingPrice: string;
  status: string;
  createdAt?: string;
}

export const emptyVariant = (): Variant => ({
  id: "",
  categoryId: "",
  seriesId: "",
  modelId: "",
  variantCode: "",
  variantName: "",
  bodyTypeId: "",
  axleBrandId: "",
  hydraulicBrandId: "",
  tyreBrandId: "",
  targetCost: "",
  sellingPrice: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiVariantToVariant = (item: any): Variant => ({
  id: String(item.variantId),
  categoryId: String(item.categoryId),
  seriesId: String(item.seriesId),
  modelId: String(item.modelId),
  variantCode: item.variantCode,
  variantName: item.variantName,
  bodyTypeId: String(item.bodyTypeId),
  axleBrandId: String(item.axleBrandId),
  hydraulicBrandId: String(item.hydraulicBrandId),
  tyreBrandId: String(item.tyreBrandId),
  targetCost: String(item.targetCost),
  sellingPrice: String(item.sellingPrice),
  status: item.status,
  createdAt: item.created,
});