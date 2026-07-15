export interface BodyType {
  id: string;
  bodyTypeName: string;
  status: string;
  createdAt?: string;
}

export const emptyBodyType = (): BodyType => ({
  id: "",
  bodyTypeName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiBodyTypeToBodyType = (item: any): BodyType => ({
  id: String(item.bodyTypeId),
  bodyTypeName: item.bodyTypeName,
  status: item.status,
  createdAt: item.created,
});