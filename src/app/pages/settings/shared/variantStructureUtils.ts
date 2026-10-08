import {
  bodyTypeOptions,
  brandOptions,
  hydraulicBrandOptions,
  tyreBrandOptions,
} from "./constants";
import {
  Category,
  Model,
  ProductSeries,
  Variant,
  VariantStructure,
} from "./types";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || id;
}

function calcSellingMarkup(targetCost: string, sellingPrice: string): string {
  const cost = Number(targetCost);
  const price = Number(sellingPrice);
  if (!cost || !price) return "";
  return String(price - cost);
}

export function buildVariantStructureFromVariant(
  variant: Variant,
  categories: Category[],
  seriesList: ProductSeries[],
  models: Model[],
  id = "",
): VariantStructure {
  const category = categories.find((item) => item.id === variant.categoryId);
  const series = seriesList.find((item) => item.id === variant.seriesId);
  const model = models.find((item) => item.id === variant.modelId);

  return {
    id,
    variantId: variant.id,
    variantCode: variant.variantCode,
    categoryCode: category?.code || "",
    categoryName: category?.categoryName || "",
    seriesCode: series?.seriesCode || "",
    seriesName: series?.seriesName || "",
    modelCode: model?.modelCode || "",
    modelName: model?.modelName || "",
    capacity: model?.capacity || "",
    axleType: model?.axleType || "",
    bodyLength: model?.length || "",
    bodyWidth: model?.width || "",
    bodyHeight: model?.height || "",
    standardWeight: model?.standardWeight || "",
    bodyType: getLabel(bodyTypeOptions, variant.bodyType),
    axleBrand: getLabel(brandOptions, variant.axleBrand),
    hydraulicBrand: getLabel(hydraulicBrandOptions, variant.hydraulicBrand),
    tyreBrand: getLabel(tyreBrandOptions, variant.tyreBrand),
    targetCost: variant.targetCost,
    sellingMarkup: calcSellingMarkup(variant.targetCost, variant.sellingPrice),
  };
}
