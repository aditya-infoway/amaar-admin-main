import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Profession } from "./data";

const RowActions = createRowActions<Profession>("profession");

export const columns: ColumnDef<Profession>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "professionName",
    accessorKey: "professionName",
    header: "Profession",
    cell: TextCell,
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Profession Slug",
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

export const exportColumns: ExportColumn<Profession>[] = [
  { key: "professionName", header: "Profession" },
  { key: "slug", header: "Profession Slug" },
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