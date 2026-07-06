import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Employee } from "./data";
import {
  getBranchLabel,
  getDepartmentLabel,
  getRoleLabel,
} from "./options";

const RowActions = createRowActions<Employee>("employee");

export const columns: ColumnDef<Employee>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "typeOfDepartment",
    accessorKey: "typeOfDepartment",
    header: "Type of Department",
    cell: (info) => getDepartmentLabel(info.getValue<string>()),
  },
  {
    id: "branch",
    accessorKey: "branch",
    header: "Branch",
    cell: (info) => getBranchLabel(info.getValue<string>()),
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    cell: (info) => getRoleLabel(info.getValue<string>()),
  },
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: "Employee Name",
    cell: TextCell,
  },
  {
    id: "mobileNumber",
    accessorKey: "mobileNumber",
    header: "Mobile No",
    cell: TextCell,
  },
  {
    id: "alternateNumber",
    accessorKey: "alternateNumber",
    header: "Alternate No",
    cell: TextCell,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: TextCell,
  },
  {
    id: "createdBy",
    accessorKey: "createdBy",
    header: "Created By",
    cell: TextCell,
  },
  {
    id: "createdType",
    accessorKey: "createdType",
    header: "Created Type",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Employee>[] = [
  {
    key: "typeOfDepartment",
    header: "Type of Department",
    format: (value: unknown) => getDepartmentLabel(value as string),
  },
  {
    key: "branch",
    header: "Branch",
    format: (value: unknown) => getBranchLabel(value as string),
  },
  {
    key: "role",
    header: "Role",
    format: (value: unknown) => getRoleLabel(value as string),
  },
  { key: "employeeName", header: "Employee Name" },
  { key: "mobileNumber", header: "Mobile No" },
  { key: "alternateNumber", header: "Alternate No" },
  { key: "email", header: "Email" },
  { key: "createdBy", header: "Created By" },
  { key: "createdType", header: "Created Type" },
];