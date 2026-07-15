import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { Model } from "./data";

const RowActions = createRowActions<Model>("model");

export function createColumns(
  getCategoryName: (id: string) => string,
  getSeriesName: (id: string) => string,
): ColumnDef<Model>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    {
      id: "categoryId",
      accessorFn: (row) => getCategoryName(row.categoryId),
      header: "Category",
      cell: TextCell,
    },
    {
      id: "seriesId",
      accessorFn: (row) => getSeriesName(row.seriesId),
      header: "Series",
      cell: TextCell,
    },
    { id: "modelCode", accessorKey: "modelCode", header: "Model Code", cell: TextCell },
    { id: "modelName", accessorKey: "modelName", header: "Model Name", cell: TextCell },
    { id: "capacity", accessorKey: "capacity", header: "Capacity", cell: TextCell },
    { id: "status", accessorKey: "status", header: "Status", cell: StatusCell },
    { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns = [
  { key: "categoryName" as const, header: "Category" },
  { key: "seriesName" as const, header: "Series" },
  { key: "modelCode" as const, header: "Model Code" },
  { key: "modelName" as const, header: "Model Name" },
  { key: "capacity" as const, header: "Capacity" },
  {
    key: "status" as const,
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];
