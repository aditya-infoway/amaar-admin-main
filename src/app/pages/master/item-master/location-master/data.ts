export interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  status: string;
  createdAt?: string;
}

export const emptyLocation = (): Location => ({
  id: "",
  locationCode: "",
  locationName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiLocationToLocation = (item: any): Location => ({
  id: String(item.locationId),
  locationCode: item.locationCode || "",
  locationName: item.locationName || "",
  status: item.status || "active",
  createdAt: item.created,
});