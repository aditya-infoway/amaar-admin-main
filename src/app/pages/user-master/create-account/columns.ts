import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Account } from "../shared/types";

const RowActions = createRowActions<Account>("account");

export const columns: ColumnDef<Account>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "srNo",
    header: "Sr No.",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    id: "accountName",
    accessorKey: "accountName",
    header: "Account Name",
    cell: TextCell,
  },
  {
    id: "group",
    accessorKey: "group",
    header: "Group",
    cell: TextCell,
  },
  {
    id: "address",
    accessorKey: "addressLine1",
    header: "Address",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value || "—";
    },
  },
  {
    id: "city",
    accessorKey: "area",
    header: "City",
    cell: TextCell,
  },
  {
    id: "state",
    accessorKey: "state",
    header: "State",
    cell: TextCell,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Number",
    cell: TextCell,
  },
  {
    id: "openingBalance",
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ getValue }) => {
      const value = parseFloat(getValue<string>() || "0");
      return `${value.toFixed(2)} DR`;
    },
  },
  {
    id: "currentBalance",
    header: "Current Balance",
    cell: ({ row }) => {
      const opening = parseFloat(row.original.openingBalance || "0");
      return `${opening.toFixed(2)} DR`;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Account>[] = [
  { key: "accountName", header: "Account Name" },
  { key: "group", header: "Group" },
  { key: "addressLine1", header: "Address" },
  { key: "area", header: "City" },
  { key: "state", header: "State" },
  { key: "phone", header: "Number" },
  {
    key: "openingBalance",
    header: "Opening Balance",
    format: (value: unknown) => {
      const num = parseFloat(value as string || "0");
      return `${num.toFixed(2)} DR`;
    },
  },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) =>
      value === "active" ? "Active" : "Inactive",
  },
];