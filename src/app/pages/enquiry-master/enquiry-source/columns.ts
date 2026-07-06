import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { EnquirySource } from "./data";

const RowActions = createRowActions<EnquirySource>("enquirySource");

export const columns: ColumnDef<EnquirySource>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "sourceName",
    accessorKey: "sourceName",
    header: "Source",
    cell: TextCell,
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Source Slug",
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

export const exportColumns: ExportColumn<EnquirySource>[] = [
  { key: "sourceName", header: "Source" },
  { key: "slug", header: "Source Slug" },
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