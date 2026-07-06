import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ProductSeries } from "./data";

const RowActions = createRowActions<ProductSeries>("product series");

export function createColumns(
  getCategoryName: (id: string) => string,
): ColumnDef<ProductSeries>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "categoryId",
      accessorFn: (row) => getCategoryName(row.categoryId),
      header: "Category",
      cell: TextCell,
    },
    {
      id: "seriesCode",
      accessorKey: "seriesCode",
      header: "Series Code",
      cell: TextCell,
    },
    {
      id: "seriesName",
      accessorKey: "seriesName",
      header: "Series Name",
      cell: TextCell,
    },
    {
      id: "capacity",
      accessorKey: "capacity",
      header: "Capacity",
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
}

export const exportColumns = [
  {
    key: "categoryId" as const,
    header: "Category",
    format: (_v: unknown, row: ProductSeries & { categoryName?: string }) =>
      row.categoryName || "",
  },
  { key: "seriesCode" as const, header: "Series Code" },
  { key: "seriesName" as const, header: "Series Name" },
  { key: "capacity" as const, header: "Capacity" },
  {
    key: "status" as const,
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];
