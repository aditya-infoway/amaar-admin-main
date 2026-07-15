export interface EnquiryStatus {
  id: string;
  statusName: string;
  status: string;
  createdAt?: string;
}

export const emptyEnquiryStatus = (): EnquiryStatus => ({
  id: "",
  statusName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiEnquiryStatusToEnquiryStatus = (item: any): EnquiryStatus => ({
  id: String(item.enquiryStatusId),
  statusName: item.statusName,
  status: item.status,
  createdAt: item.created,
});