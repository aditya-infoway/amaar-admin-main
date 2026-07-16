export interface ItemMaster {
  id: string;
  itemCode: string;
  itemName: string;
  shortName: string;
  hsnCode: string;
  itemLocation?: string;
  itemCategoryId: string;
  categoryName?: string;
  groupId: string;
  groupName?: string;
  unit: string;
  taxSlab: string;
  stockMapping: boolean;
  minQty: string;
  maxQty: string;
  purchasePrice: string;
  actualPurchasePrice: string;
  salesPrice: string;
  mrp: string;
  barcodeType: "manual" | "generate";
  barcode: string;
  status: string;
  createdAt?: string;
}

export const emptyItem = (): ItemMaster => ({
  id: "",
  itemCode: "",
  itemName: "",
  shortName: "",
  hsnCode: "",
  itemLocation: "",
  itemCategoryId: "",
  groupId: "",
  unit: "",
  taxSlab: "",
  stockMapping: false,
  minQty: "",
  maxQty: "",
  purchasePrice: "",
  actualPurchasePrice: "",
  salesPrice: "",
  mrp: "",
  barcodeType: "manual",
  barcode: "",
  status: "active",
});

export const mapApiItemMasterToItemMaster = (item: any): ItemMaster => ({
  id: String(item.itemId),
  itemCode: item.itemCode || "",
  itemName: item.itemName || "",
  shortName: item.shortName || "",
  hsnCode: item.hsnCode || "",
  itemLocation: item.itemLocation || "",
  itemCategoryId: item.itemCategoryId ? String(item.itemCategoryId) : "",
  categoryName: item.categoryName || "",
  groupId: item.groupId ? String(item.groupId) : "",
  groupName: item.groupName || "",
  unit: item.unit || "",
  taxSlab: item.taxSlab || "",
  stockMapping: Boolean(item.stockMapping),
  minQty: item.minQty != null ? String(item.minQty) : "",
  maxQty: item.maxQty != null ? String(item.maxQty) : "",
  purchasePrice: item.purchasePrice != null ? String(item.purchasePrice) : "",
  actualPurchasePrice: item.actualPurchasePrice != null ? String(item.actualPurchasePrice) : "",
  salesPrice: item.salesPrice != null ? String(item.salesPrice) : "",
  mrp: item.mrp != null ? String(item.mrp) : "",
  barcodeType: item.barcodeType || "manual",
  barcode: item.barcode || "",
  status: item.status || "active",
  createdAt: item.created,
});