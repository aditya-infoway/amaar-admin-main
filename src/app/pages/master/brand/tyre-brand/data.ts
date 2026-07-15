export interface TyreBrand {
  id: string;
  tyreBrandName: string;
  status: string;
  createdAt?: string;
}

export const emptyTyreBrand = (): TyreBrand => ({
  id: "",
  tyreBrandName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiTyreBrandToTyreBrand = (item: any): TyreBrand => ({
  id: String(item.tyreBrandId),
  tyreBrandName: item.tyreBrandName,
  status: item.status,
  createdAt: item.created,
});