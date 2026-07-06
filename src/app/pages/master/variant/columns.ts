import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { Variant } from "./data";

const RowActions = createRowActions<Variant>("variant");

export function createColumns(
  getCategoryName: (id: string) => string,
  getSeriesName: (id: string) => string,
  getModelName: (id: string) => string,
): ColumnDef<Variant>[] {
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
    {
      id: "modelId",
      accessorFn: (row) => getModelName(row.modelId),
      header: "Model",
      cell: TextCell,
    },
    { id: "variantCode", accessorKey: "variantCode", header: "Variant Code", cell: TextCell },
    { id: "variantName", accessorKey: "variantName", header: "Variant Name", cell: TextCell },
    { id: "targetCost", accessorKey: "targetCost", header: "Target Cost", cell: TextCell },
    { id: "sellingPrice", accessorKey: "sellingPrice", header: "Selling Price", cell: TextCell },
    { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns = [
  { key: "categoryName" as const, header: "Category" },
  { key: "seriesName" as const, header: "Series" },
  { key: "modelName" as const, header: "Model" },
  { key: "variantCode" as const, header: "Variant Code" },
  { key: "variantName" as const, header: "Variant Name" },
  { key: "targetCost" as const, header: "Target Cost" },
  { key: "sellingPrice" as const, header: "Selling Price" },
];
