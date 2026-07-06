import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Banker } from "./data";

const RowActions = createRowActions<Banker>("banker");

export const columns: ColumnDef<Banker>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "bankerName",
    accessorKey: "bankerName",
    header: "Banker",
    cell: TextCell,
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Banker Slug",
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

export const exportColumns: ExportColumn<Banker>[] = [
  { key: "bankerName", header: "Banker" },
  { key: "slug", header: "Banker Slug" },
  {
    key: "createdAt",
    header: "Created On",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) =>
      value === "active" ? "Active" : "Inactive",
  },
];