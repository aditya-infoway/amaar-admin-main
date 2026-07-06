import { EnquirySource } from "../shared/types";

export type { EnquirySource };

export const emptyEnquirySource = (): EnquirySource => ({
  id: "",
  code: "",
  sourceName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});