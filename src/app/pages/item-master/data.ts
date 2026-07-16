import { ItemMaster } from "../master/shared/types";

export type { ItemMaster };

export const emptyItem = (): ItemMaster => ({
  id: "",
  itemCode: "",
  itemName: "",
  shortName: "",
  hsnCode: "",
  itemCategory: "",
  group: "",
  unit: "",
  taxSlab: "",
  stockMapping: false,
  minQty: "",
  maxQty: "",
  itemType: "",
  suppliers: [],
  purchasePrice: "",
  actualPurchasePrice: "",
  salesPrice: "",
  mrp: "",
  barcode: "",
});
