export interface StockReportItem {
  id: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  categoryName: string;
  groupName: string;
  purchasePrice: string;
  salesPrice: string;
  taxSlab: string;
  currentStock: string;
}

export const mapApiStockReportItemToStockReportItem = (item: any): StockReportItem => ({
  id: String(item.id),
  itemCode: item.itemCode ?? "",
  itemName: item.itemName ?? "",
  hsnCode: item.hsnCode ?? "",
  unit: item.unit ?? "",
  categoryName: item.categoryName ?? "",
  groupName: item.groupName ?? "",
  purchasePrice: item.purchasePrice ?? "0",
  salesPrice: item.salesPrice ?? "0",
  taxSlab: item.taxSlab ?? "0",
  currentStock: item.currentStock ?? "0",
});

export interface StockReportDetailRow {
  id: string;
  date: string;
  partyName: string;
  billNo: string;
  qty: string;
  billAmount: string;
  currentStock: string;
}

export interface StockReportDetail {
  itemId: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  categoryName: string;
  groupName: string;
  rows: StockReportDetailRow[];
}