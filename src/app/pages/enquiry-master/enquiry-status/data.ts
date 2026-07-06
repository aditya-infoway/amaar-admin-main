import { EnquiryStatus } from "../shared/types";

export type { EnquiryStatus };

export const emptyEnquiryStatus = (): EnquiryStatus => ({
  id: "",
  code: "",
  statusName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});