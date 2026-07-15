export interface EnquiryType {
  id: string;
  enquiryTypeName: string;
  status: string;
  createdAt?: string;
}

export const emptyEnquiryType = (): EnquiryType => ({
  id: "",
  enquiryTypeName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiEnquiryTypeToEnquiryType = (item: any): EnquiryType => ({
  id: String(item.enquiryTypeId),
  enquiryTypeName: item.enquiryTypeName,
  status: item.status,
  createdAt: item.created,
});