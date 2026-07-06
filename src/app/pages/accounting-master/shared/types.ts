
export interface Banker {
  id: string;
  bankerName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}
export interface CashPayment {
  id: string;
  paymentMode: "manual" | "bom";
  cashAccount: string;
  voucherNo: string;
  date: string;
  oppAccount: string;
  amount: string;
  narration: string;
  createdAt: string;
  bomNo?: { id: string; label: string }[];


}
// Add these to your types.ts file

export interface Category {
  id: string;
  code: string;
  categoryName: string;
}

export interface ProductSeries {
  id: string;
  seriesCode: string;
  seriesName: string;
  categoryId: string;
}

export interface Model {
  id: string;
  modelCode: string;
  modelName: string;
  seriesId: string;
  capacity: string;
  axleType: string;
  length: string;
  width: string;
  height: string;
  standardWeight: string;
}

export interface Variant {
  id: string;
  variantCode: string;
  categoryId: string;
  seriesId: string;
  modelId: string;
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
export interface BankPayment {
  id: string;
  paymentMode: "manual" | "bom";
  bomNo?: { id: string; label: string }[];
  bankAccount: string;
  voucherNo: string;
  date: string;
  oppAccount: string;
  amount: string;
  transactionMode: "neft" | "rtgs" | "imps" | "cheque" | "upi";
  chequeNumber?: string;
  chequeDate?: string;
  chequeClearDate?: string;
  narration: string;
  createdAt: string;
}
export interface CashReceipt {
  id: string;
  receiptMode: "manual" | "lead" | "job-card";
  cashAccount: string;
  voucherNo: string;
  date: string;
  oppAccount: string;
  amount: string;
  narration: string;
  createdAt: string;
}
export interface BankReceipt {
  id: string;
  receiptMode: "manual" | "lead" | "job-card";
  bankAccount: string;
  voucherNo: string;
  date: string;
  oppAccount: string;
  amount: string;
  transactionMode: "neft" | "rtgs" | "imps" | "cheque" | "upi";
  narration: string;
  createdAt: string;
}
export interface Contra {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  account: string;
  voucherNo: string;
  date: string;
  oppAccount: string;
  amount: string;
  narration: string;
  createdAt: string;
}
export interface JournalEntry {
  id: string;
  type: "general" | "adjustment" | "rectification" | "closing";
  drAccount: string;
  crAccount: string;
  voucherNo: string;
  date: string;
  amount: string;
  narration: string;
  createdAt: string;
}