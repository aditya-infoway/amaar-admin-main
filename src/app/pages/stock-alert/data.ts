export interface StockReportItem {
  id: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  categoryName: string;
  groupName: string;
  // purchasePrice: string;
  // salesPrice: string;
  taxSlab: string;
  minQty: string;
  maxQty: string;
}

export const mapApiStockReportItemToStockReportItem = (
  item: any,
): StockReportItem => ({
  id: String(item.id),
  itemCode: item.itemCode ?? "",
  itemName: item.itemName ?? "",
  hsnCode: item.hsnCode ?? "",
  unit: item.unit ?? "",
  categoryName: item.categoryName ?? "",
  groupName: item.groupName ?? "",
  // purchasePrice: item.purchasePrice ?? "0",
  // salesPrice: item.salesPrice ?? "0",
  taxSlab: item.taxSlab ?? "0",
  minQty: item.minQty ?? "0",
  maxQty: item.maxQty ?? "0",
});
