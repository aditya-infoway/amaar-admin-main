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
    accessorKey: "groupName",
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
    accessorKey: "cityName",
    header: "City",
    cell: TextCell,
  },
  {
    id: "state",
    accessorKey: "stateName",
    header: "State",
    cell: TextCell,
  },
  {
    id: "phone",
    accessorKey: "mobileNo",
    header: "Number",
    cell: TextCell,
  },
  {
    id: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => {
      const value = parseFloat(row.original.openingBalance || "0");
      return `${value.toFixed(2)} ${row.original.drOrCr || "DR"}`;
    },
  },
  {
    id: "currentBalance",
    header: "Current Balance",
    cell: ({ row }) => {
      const value = parseFloat(row.original.currentBalance || "0");
      return `${value.toFixed(2)} ${row.original.currentDrOrCr || "DR"}`;
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
  { key: "groupName", header: "Group" },
  { key: "addressLine1", header: "Address" },
  { key: "cityName", header: "City" },
  { key: "stateName", header: "State" },
  { key: "mobileNo", header: "Number" },
  {
    key: "openingBalance",
    header: "Opening Balance",
    format: (value: unknown, row: any) => {
      const num = parseFloat((value as string) || "0");
      return `${num.toFixed(2)} ${row.drOrCr || "DR"}`;
    },
  },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];