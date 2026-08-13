export interface Enquiry {
  id: string;        // DB column: leadId (PK)
  leadCode: string;  // generated code, table me "Lead Id" column ke naam se dikhega
  name: string;
  number: string;
  email: string;
  address: string;
  city: string;
  model: string;
  remark: string;
  nextFollowupDate: string;
  createdBy: string;
  createdType: string;
  createdAt: string;
}

export const emptyEnquiry = (): Enquiry => ({
  id: "",
  leadCode: "",
  name: "",
  number: "",
  email: "",
  address: "",
  city: "",
  model: "",
  remark: "",
  nextFollowupDate: "",
  createdBy: "",
  createdType: "Super Admin",
  createdAt: new Date().toISOString(),
});

export function mapApiLeadToEnquiry(api: any): Enquiry {
  return {
    id: String(api.leadId),
    leadCode: api.leadCode ?? "",
    name: api.name ?? "",
    number: api.number ?? "",
    email: api.email ?? "",
    address: api.address ?? "",
    city: api.city ?? "",
    model: api.model != null ? String(api.model) : "",
    remark: api.remark ?? "",
    nextFollowupDate: api.nextFollowupDate ?? "",
    createdBy: api.createdBy != null ? String(api.createdBy) : "",
    createdType: api.createdType ?? "Super Admin",
    createdAt: api.created ?? new Date().toISOString(),
  };
}