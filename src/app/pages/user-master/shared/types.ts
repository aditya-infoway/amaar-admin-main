export interface Category {
  id: string;
  code: string;
  categoryName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}
export interface EnquirySource {
  id: string;
  code: string;
  sourceName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}
export interface Finance {
  id: string;
  financeName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}
export interface Employee {
  id: string;
  typeOfDepartment: string;
  branch: string;
  role: string;
  employeeName: string;
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  password: string;
  createdBy: string;
  createdType: string;
  createdAt: string;
}
export interface EnquiryStatus {
  id: string;
  code: string;
  statusName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
}
export interface Profession {
  id: string;
  code: string;
  professionName: string;
  slug: string;
  createdAt: string;
  status: "active" | "inactive";
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
}

export interface Account {
  id: string;
  accountName: string;
  printName?: string;

  groupId?: string | number;
  groupName?: string;

  openingBalance?: string;
  drOrCr?: string;
  currentBalance?: string;
  currentDrOrCr?: string;

  countryName?: string;
  stateName?: string;
  stateCode?: string;
  districtName?: string;
  talukaName?: string;
  cityName?: string;
  area?: string;

  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;

  phoneNo?: string;
  mobileNo?: string;
  email?: string;

  // 👇 Add these
  contactPersonName?: string;
  birthdayOn?: string;
  anniversary?: string;

  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;

  gstNo?: string;
  panCard?: string;
  aadharCardNo?: string;

  status: string;
  createdAt?: string;
}

// API se aane wale raw row ko frontend Type me map karta hai (EnquiryType jaisa hi pattern)
export const mapApiAccountToAccount = (item: any): Account => ({
  id: String(item.id),
  accountName: item.accountName,
  printName: item.printName,
  groupId: item.groupId,
  groupName: item.groupName,
  openingBalance: item.openingBalance,
  drOrCr: item.drOrCr,
  currentBalance: item.currentBalance,
  currentDrOrCr: item.currentDrOrCr,
  countryName: item.countryName,
  stateName: item.stateName,
  stateCode: item.stateCode ?? "",
  cityName: item.cityName,
  districtName: item.districtName,
  talukaName: item.talukaName,
  area: item.area,
  addressLine1: item.addressLine1,
  addressLine2: item.addressLine2,
  pincode: item.pincode,
  phoneNo: item.phoneNo,
  mobileNo: item.mobileNo,
  email: item.email,
  status: item.status,
  createdAt: item.created,
});