import { Employee } from "../shared/types";

export type { Employee };

export const emptyEmployee = (): Employee => ({
  id: "",
  typeOfDepartment: "",
  branch: "",
  role: "",
  employeeName: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  password: "",
  createdBy: "",
  createdType: "Manual",
  createdAt: new Date().toISOString(),
});