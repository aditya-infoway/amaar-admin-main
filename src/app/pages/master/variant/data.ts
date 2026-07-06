import { Variant } from "../shared/types";

export type { Variant };

export const emptyVariant = (): Variant => ({
  id: "",
  categoryId: "",
  seriesId: "",
  modelId: "",
  variantCode: "",
  variantName: "",
  bodyType: "",
  axleBrand: "",
  hydraulicBrand: "",
  tyreBrand: "",
  targetCost: "",
  sellingPrice: "",
});
