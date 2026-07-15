export interface EnquirySource {
  id: string;
  sourceName: string;
  status: string;
  createdAt?: string;
}

export const emptyEnquirySource = (): EnquirySource => ({
  id: "",
  sourceName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiEnquirySourceToEnquirySource = (item: any): EnquirySource => ({
  id: String(item.enquirySourceId),
  sourceName: item.sourceName,
  status: item.status,
  createdAt: item.created,
});