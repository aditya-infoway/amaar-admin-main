import { Enquiry } from "../shared/types";

export type { Enquiry };

export const emptyEnquiry = (): Enquiry => ({
  id: "",
  leadId: "",
  name: "",
  number: "",
  email: "",
  address: "",
  city: "",
  model: "",
  remark: "",
  nextFollowupDate: "",
  createdBy: "",
  createdType: "Manual",
  createdAt: new Date().toISOString(),
});