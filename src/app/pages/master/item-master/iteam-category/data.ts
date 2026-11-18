export interface ItemCategory {
  id: string;
  categoryName: string;
  status: string;
  createdBy?: string;
  createdType?: string;
  createdAt?: string;

  type: "manual" | "default";

  // Item Code settings
  itemCodeType: "manual" | "auto";
  prefix?: string;
  suffix?: string;
  serialNo?: string; // string, taaki leading zeros (00001) bane rahein

  // Poora code (prefix + suffix + serialNo), table me dikhane ke liye
  itemCode?: string;
}

// Poora item code banata hai. Order sketch ke hisaab se: prefix + suffix + serialNo
export const buildItemCode = (
  prefix?: string,
  suffix?: string,
  serialNo?: string,
) => `${prefix || ""}${suffix || ""}${serialNo || ""}`;

export const emptyItemCategory = (): ItemCategory => ({
  id: "",
  categoryName: "",
  status: "active",
  createdBy: "",
  createdType: "",
  type: "manual",
  itemCodeType: "manual",
  prefix: "",
  suffix: "",
  serialNo: "",
  itemCode: "",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiItemCategoryToItemCategory = (item: any): ItemCategory => {
  const prefix = item.prefix || "";
  const suffix = item.suffix || "";
  const serialNo = item.serialNo || "";

  return {
    id: String(item.itemCategoryId),
    categoryName: item.categoryName,
    status: item.status,
    createdBy: item.createdBy || "",
    createdType: item.createdType || "",
    createdAt: item.created,
    type: item.categoryType,
    itemCodeType: item.itemCodeType || "manual",
    prefix,
    suffix,
    serialNo,
    // Agar backend se poora code aata hai to wahi use hoga, warna yahin bana lenge
    itemCode: item.itemCode || buildItemCode(prefix, suffix, serialNo),
  };
};