export interface BOM2 {
  id: string;
  bomId: string;
  itemName: string;
  itemCode: string;
  bomCode: string;
  bomName: string;
  quantity: string;
  unit: string;
  status: string;
  createdAt?: string;
}

export const emptyBOM2 = (): BOM2 => ({
  id: "",
  bomId: "",
  itemName: "",
  itemCode: "",
  bomCode: "",
  bomName: "",
  quantity: "",
  unit: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiBOM2ToBOM2 = (item: any): BOM2 => ({
  id: String(item.bom2Id || item.id),
  bomId: String(item.bomId ?? item.id),
  itemName: item.itemName || "",
  itemCode: item.itemCode || "",
  bomCode: item.bomCode || "",
  bomName: item.bomName || "",
  quantity: item.quantity || "",
  unit: item.unit || "",
  status: item.status || "active",
  createdAt: item.created || item.createdAt,
});
