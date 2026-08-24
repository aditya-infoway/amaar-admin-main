import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { BOM2 } from "./data";

const RowActions = createRowActions<BOM2>("bom2");

export const columns: ColumnDef<BOM2>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "itemName",
    accessorKey: "itemName",
    header: "Item Name",
    cell: TextCell,
  },
  {
    id: "itemCode",
    accessorKey: "itemCode",
    header: "Item Code",
    cell: TextCell,
  },
  {
    id: "bomCode",
    accessorKey: "bomCode",
    header: "BOM Code",
    cell: TextCell,
  },
  {
    id: "bomName",
    accessorKey: "bomName",
    header: "BOM Name",
    cell: TextCell,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Quantity",
    cell: TextCell,
  },
  {
    id: "unit",
    accessorKey: "unit",
    header: "Unit",
    cell: TextCell,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created On",
    cell: (info) => {
      const value = info.getValue<string>();
      return value ? new Date(value).toLocaleDateString() : "—";
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<BOM2>[] = [
  { key: "itemName", header: "Item Name" },
  { key: "itemCode", header: "Item Code" },
  { key: "bomCode", header: "BOM Code" },
  { key: "bomName", header: "BOM Name" },
  { key: "quantity", header: "Quantity" },
  { key: "unit", header: "Unit" },
  {
    key: "createdAt",
    header: "Created On",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];
