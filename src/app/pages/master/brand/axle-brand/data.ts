export interface AxleBrand {
  id: string;
  axleBrandName: string;
  status: string;
  createdAt?: string;
}

export const emptyAxleBrand = (): AxleBrand => ({
  id: "",
  axleBrandName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiAxleBrandToAxleBrand = (item: any): AxleBrand => ({
  id: String(item.axleBrandId),
  axleBrandName: item.axleBrandName,
  status: item.status,
  createdAt: item.created,
});