export interface HydraulicBrand {
  id: string;
  hydraulicBrandName: string;
  status: string;
  createdAt?: string;
}

export const emptyHydraulicBrand = (): HydraulicBrand => ({
  id: "",
  hydraulicBrandName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiHydraulicBrandToHydraulicBrand = (item: any): HydraulicBrand => ({
  id: String(item.hydraulicBrandId),
  hydraulicBrandName: item.hydraulicBrandName,
  status: item.status,
  createdAt: item.created,
});