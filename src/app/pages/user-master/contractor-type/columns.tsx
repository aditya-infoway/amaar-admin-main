import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ContractorEmployee } from "./data";

const RowActions = createRowActions<ContractorEmployee>("contractor");

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

export const columns: ColumnDef<ContractorEmployee>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "department",
    accessorFn: (row) => getDepartmentLabel(row.department),
    header: "Department",
    cell: TextCell,
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
  { id: "email", accessorKey: "email", header: "Email", cell: TextCell },
  {
    id: "createdAt",
    accessorFn: (row) => formatDate(row.createdAt),
    header: "Created Date",
    cell: TextCell,
  },
  {
    id: "contractorTypes",
    accessorFn: (row) => row.contractorTypes.join(", ") || "—",
    header: "Type",
    cell: TextCell,
  },
  { id: "actions", header: "Action", cell: RowActions, enableSorting: false },
];

export const exportColumns = [
  { key: "departmentName" as const, header: "Department" },
  { key: "employeeName" as const, header: "Employee Name" },
  { key: "mobileNumber" as const, header: "Mobile No" },
  { key: "email" as const, header: "Email" },
  { key: "createdDate" as const, header: "Created Date" },
  { key: "contractorType" as const, header: "Type" },
];

const DEPARTMENT_LABELS: Record<string, string> = {
  sale: "Sale",
  production: "Production",
  security: "Security",
  hrms: "HRMS",
  canteen: "Canteen",
};

export const getDepartmentLabel = (id: string) =>
  DEPARTMENT_LABELS[id] || id || "—";
