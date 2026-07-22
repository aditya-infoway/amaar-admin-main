import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { Employee } from "./data";
import { getBranchLabel, getDepartmentLabel } from "./options";

const RowActions = createRowActions<Employee>("employee");

export function createColumns(
  getRoleName: (id: string) => string,
): ColumnDef<Employee>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    {
      id: "department",
      accessorFn: (row) => getDepartmentLabel(row.department),
      header: "Department",
      cell: TextCell,
    },
    {
      id: "branch",
      accessorFn: (row) => getBranchLabel(row.branch),
      header: "Branch",
      cell: TextCell,
    },
    {
      id: "roleId",
      accessorFn: (row) => getRoleName(row.roleId),
      header: "Role",
      cell: TextCell,
    },
    { id: "employeeName", accessorKey: "employeeName", header: "Employee Name", cell: TextCell },
    { id: "mobileNumber", accessorKey: "mobileNumber", header: "Mobile No", cell: TextCell },
    { id: "alternateNumber", accessorKey: "alternateNumber", header: "Alternate No", cell: TextCell },
    { id: "email", accessorKey: "email", header: "Email", cell: TextCell },
    { id: "createdBy", accessorKey: "createdBy", header: "Created By", cell: TextCell },
    { id: "createdType", accessorKey: "createdType", header: "Created Type", cell: TextCell },
    { id: "actions", header: "Action", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns = [
  { key: "departmentName" as const, header: "Department" },
  { key: "branchName" as const, header: "Branch" },
  { key: "roleName" as const, header: "Role" },
  { key: "employeeName" as const, header: "Employee Name" },
  { key: "mobileNumber" as const, header: "Mobile No" },
  { key: "alternateNumber" as const, header: "Alternate No" },
  { key: "email" as const, header: "Email" },
  { key: "createdBy" as const, header: "Created By" },
  { key: "createdType" as const, header: "Created Type" },
];