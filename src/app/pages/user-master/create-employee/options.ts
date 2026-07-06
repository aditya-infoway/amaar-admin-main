export interface DepartmentOption {
  id: string;
  label: string;
}

export interface RoleOption {
  id: string;
  label: string;
  departmentId: string;
}

export interface BranchOption {
  id: string;
  label: string;
}

export const departmentOptions: DepartmentOption[] = [
  { id: "sale", label: "Sale" },
  { id: "production", label: "Production" },
];

export const roleOptions: RoleOption[] = [
  { id: "sale-manager", label: "Sale Manager", departmentId: "sale" },
  { id: "sale-executive", label: "Sale Executive", departmentId: "sale" },
  { id: "telecaller", label: "Telecaller", departmentId: "sale" },
  { id: "accountant", label: "Accountant", departmentId: "sale" },
  { id: "cashier", label: "Cashier", departmentId: "sale" },
  { id: "cutting", label: "Cutting", departmentId: "production" },
  { id: "welding", label: "Welding", departmentId: "production" },
  { id: "fitting", label: "Fitting", departmentId: "production" },
  { id: "blasting", label: "Blasting", departmentId: "production" },
  { id: "paint", label: "Paint", departmentId: "production" },
  { id: "washing", label: "Washing", departmentId: "production" },
  { id: "qc", label: "QC", departmentId: "production" },
  {
    id: "production-manager",
    label: "Production Manager",
    departmentId: "production",
  },
];

// Replace with your real Branch master once it exists
export const branchOptions: BranchOption[] = [
  { id: "main-branch", label: "Main Branch" },
];

export function getRolesForDepartment(departmentId: string): RoleOption[] {
  return roleOptions.filter((role) => role.departmentId === departmentId);
}

export function getDepartmentLabel(departmentId: string): string {
  return (
    departmentOptions.find((item) => item.id === departmentId)?.label || "—"
  );
}

export function getRoleLabel(roleId: string): string {
  return roleOptions.find((item) => item.id === roleId)?.label || "—";
}

export function getBranchLabel(branchId: string): string {
  return branchOptions.find((item) => item.id === branchId)?.label || "—";
}