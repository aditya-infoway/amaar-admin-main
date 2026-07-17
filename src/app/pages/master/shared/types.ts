export interface Category {
  id: string;
  code: string;
  categoryName: string;
  status: string;
  slug: string;
  createdAt: string;
}

export interface ProductSeries {
  id: string;
  categoryId: string;
  seriesCode: string;
  seriesName: string;
  capacity: string;
  status: string;
}

export interface Model {
  id: string;
  categoryId: string;
  seriesId: string;
  modelCode: string;
  modelName: string;
  axleType: string;
  capacity: string;
  length: string;
  width: string;
  height: string;
  standardWeight: string;
  status: string;
}

export interface Variant {
  id: string;
  categoryId: string;
  seriesId: string;
  modelId: string;
  variantCode: string;
  variantName: string;
  bodyType: string;
  axleBrand: string;
  hydraulicBrand: string;
  tyreBrand: string;
  targetCost: string;
  sellingPrice: string;
}

export interface VariantStructure {
  id: string;
  variantId: string;
  variantCode: string;
  categoryCode: string;
  categoryName: string;
  seriesCode: string;
  seriesName: string;
  modelCode: string;
  modelName: string;
  capacity: string;
  axleType: string;
  bodyLength: string;
  bodyWidth: string;
  bodyHeight: string;
  standardWeight: string;
  bodyType: string;
  axleBrand: string;
  hydraulicBrand: string;
  tyreBrand: string;
  targetCost: string;
  sellingMarkup: string;
}

export interface ItemMaster {
  id: string;
  itemCode: string;
  itemName: string;
  shortName: string;
  itemCategory: string;
  group: string;
  unit: string;
  taxSlab: string;
  stockMapping: boolean;
  minQty: string;
  maxQty: string;
  itemType: string;
  suppliers: string[];
  purchasePrice: string;
  actualPurchasePrice: string;
  salesPrice: string;
  mrp: string;
  barcode: string;
  hsnCode: string;

}