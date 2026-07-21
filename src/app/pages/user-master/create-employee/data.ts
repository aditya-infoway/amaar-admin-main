export interface Employee {
  id: string;
  department: string;
  branch: string;
  roleId: string;
  employeeName: string;
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  password: string;
  createdBy: string;
  createdType: string;
  createdAt: string;
}

export const emptyEmployee = (): Employee => ({
  id: "",
  department: "",
  branch: "main-branch",
  roleId: "",
  employeeName: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  password: "",
  createdBy: "",
  createdType: "Manual",
  createdAt: new Date().toISOString(),
});

// ---- Map backend response (employeeId, numeric ids) to frontend Employee shape ----
export function mapApiEmployeeToEmployee(apiEmployee: any): Employee {
  return {
    id: String(apiEmployee.employeeId),
    department: apiEmployee.department ?? "",
    branch: apiEmployee.branch ?? "main-branch",
    roleId: String(apiEmployee.roleId ?? ""),
    employeeName: apiEmployee.employeeName ?? "",
    mobileNumber: apiEmployee.mobileNumber ?? "",
    alternateNumber: apiEmployee.alternateNumber ?? "",
    email: apiEmployee.email ?? "",
    password: "",
    createdBy: apiEmployee.createdBy ?? "",
    createdType: apiEmployee.createdType ?? "",
    createdAt: apiEmployee.created ?? "",
  };
}