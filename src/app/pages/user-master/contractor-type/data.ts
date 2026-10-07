export interface ContractorEmployee {
  id: string;
  department: string;
  roleName: string;
  employeeName: string;
  mobileNumber: string;
  email: string;
  contractorTypes: string[];
  createdAt: string;
}

export const CONTRACTOR_TYPE_OPTIONS = [
  "Cutting Manager",
  "Welding Manager",
  "Fitting Manager",
  "Blasting Manager",
  "Paint Manager",
  "Washing Manager",
  "QC Manager",
].map((label) => ({ id: label, label }));

export function mapApiToContractorEmployee(api: any): ContractorEmployee {
  return {
    id: String(api.employeeId ?? api.id),
    department: api.department ?? "",
    roleName: api.roleName ?? api.role ?? "Contractor Manager",
    employeeName: api.employeeName ?? "",
    mobileNumber: api.mobileNumber ?? api.mobileNo ?? "",
    email: api.email ?? "",
    contractorTypes: Array.isArray(api.contractorTypes)
      ? api.contractorTypes
      : [],
    createdAt: api.created ?? api.createdAt ?? "",
  };
}
