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
  openingStock?: string;
  stockValue?: string;
  thickness?: string;
  length?: string;
  width?: string;
  weight?: string;
  barcodeType: "manual" | "generate";
  barcode: string;
  status: string;
  createdBy?: string;
  createdType?: string;
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
  openingStock: "",
  stockValue: "",
  thickness: "",
  length: "",
  width: "",
  weight: "",
  barcodeType: "manual",
  barcode: "",
  status: "active",
  createdBy: "",
  createdType: "",
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
  openingStock: item.openingStock != null ? String(item.openingStock) : "",
  stockValue: item.stockValue != null ? String(item.stockValue) : "",
  thickness: item.thickness != null ? String(item.thickness) : "",
  length: item.length != null ? String(item.length) : "",
  width: item.width != null ? String(item.width) : "",
  weight: item.weight != null ? String(item.weight) : "",
  barcodeType: item.barcodeType || "manual",
  barcode: item.barcode || "",
  status: item.status || "active",
  createdBy: item.createdBy || "",
  createdType: item.createdType || "",
  createdAt: item.created
    ? new Date(item.created).toLocaleDateString("en-IN")
    : "",
});
