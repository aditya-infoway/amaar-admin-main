export interface OptionItem {
  id: string;
  label: string;
}

export const departmentOptions: OptionItem[] = [
  { id: "sale", label: "Sale" },
  { id: "production", label: "Production" },
  { id: "security", label: "Security" },
];

// Abhi sirf ek hi branch hai — hamesha default select rahega
export const branchOptions: OptionItem[] = [
  { id: "0", label: "Main Branch" },
];

export function getDepartmentLabel(departmentId: string): string {
  return departmentOptions.find((item) => item.id === departmentId)?.label || "—";
}

export function getBranchLabel(branchId: string): string {
  return branchOptions.find((item) => item.id === branchId)?.label || "—";
}