import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { Category } from "./data";

const RowActions = createRowActions<Category>("category");

export const columns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "code",
    accessorKey: "code",
    header: "Code",
    cell: TextCell,
  },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: "Category Name",
    cell: TextCell,
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

export const exportColumns = [
  { key: "code" as const, header: "Code" },
  { key: "categoryName" as const, header: "Category Name" },
  {
    key: "status" as const,
    header: "Status",
    format: (value: unknown) =>
      value === "active" ? "Active" : "Inactive",
  },
];
