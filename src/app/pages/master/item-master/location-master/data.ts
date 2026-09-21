export interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  status: string;
  createdBy?: string; 
 createdType?: string;   
  createdAt?: string;
}

export const emptyLocation = (): Location => ({
  id: "",
  locationCode: "",
  locationName: "",
  status: "active",
  createdBy: "",   
  createdType :""
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiLocationToLocation = (item: any): Location => ({
  id: String(item.locationId),
  locationCode: item.locationCode || "",
  locationName: item.locationName || "",
  status: item.status || "active",
  createdBy: item.createdBy || "", 
   createdType: item.createdType || "",  
  createdAt: item.created,
});