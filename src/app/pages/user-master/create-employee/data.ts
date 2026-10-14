export interface Employee {
  id: string;
  department: string;
  branch: string;
  roleId: string;
  processId?: number | string | null;
  subProcessId?: number | string | null;
  accountId?: number | string | null;
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
  processId: "",
  subProcessId: "",
  accountId: "",
  employeeName: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  password: "",
  createdBy: "",
  createdType: "",
  createdAt: new Date().toISOString(),
});

// ---- Map backend response (employeeId, numeric ids) to frontend Employee shape ----
export function mapApiEmployeeToEmployee(apiEmployee: any): Employee {
  return {
    id: String(apiEmployee.employeeId),
    department: apiEmployee.department ?? "",
    branch: apiEmployee.branch ?? "main-branch",
    // Production me roleId 0 hota hai, use khali rakho
    roleId: apiEmployee.roleId ? String(apiEmployee.roleId) : "",
    processId: apiEmployee.processId ?? "",
    subProcessId: apiEmployee.subProcessId ?? "",
    employeeName: apiEmployee.employeeName ?? "",
    mobileNumber: apiEmployee.mobileNumber ?? "",
    alternateNumber: apiEmployee.alternateNumber ?? "",
    email: apiEmployee.email ?? "",
    password: "",
    accountId: apiEmployee.accountId ?? "",
    createdBy: apiEmployee.createdBy ?? "",
    createdType: apiEmployee.createdType ?? "",
    createdAt: apiEmployee.created ?? "",
  };
}