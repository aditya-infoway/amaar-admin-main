import { VariantStructure } from "../shared/types";

export type { VariantStructure };

export const emptyVariantStructure = (): VariantStructure => ({
  id: "",
  variantId: "",
  variantCode: "",
  categoryCode: "",
  categoryName: "",
  seriesCode: "",
  seriesName: "",
  modelCode: "",
  modelName: "",
  capacity: "",
  axleType: "",
  bodyLength: "",
  bodyWidth: "",
  bodyHeight: "",
  standardWeight: "",
  bodyType: "",
  axleBrand: "",
  hydraulicBrand: "",
  tyreBrand: "",
  targetCost: "",
  sellingMarkup: "",
});
