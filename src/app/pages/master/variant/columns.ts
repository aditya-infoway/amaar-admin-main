import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { StatusCell, TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Variant } from "./data";

const RowActions = createRowActions<Variant>("variant");

export function createColumns(
  getCategoryName: (id: string) => string,
  getSeriesName: (id: string) => string,
  getModelName: (id: string) => string,
  getBodyTypeName: (id: string) => string,
  getAxleBrandName: (id: string) => string,
  getHydraulicBrandName: (id: string) => string,
  getTyreBrandName: (id: string) => string,
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
    {
      id: "bodyTypeId",
      accessorFn: (row) => getBodyTypeName(row.bodyTypeId),
      header: "Body Type",
      cell: TextCell,
    },
    {
      id: "axleBrandId",
      accessorFn: (row) => getAxleBrandName(row.axleBrandId),
      header: "Axle Brand",
      cell: TextCell,
    },
    {
      id: "hydraulicBrandId",
      accessorFn: (row) => getHydraulicBrandName(row.hydraulicBrandId),
      header: "Hydraulic Brand",
      cell: TextCell,
    },
    {
      id: "tyreBrandId",
      accessorFn: (row) => getTyreBrandName(row.tyreBrandId),
      header: "Tyre Brand",
      cell: TextCell,
    },
    { id: "targetCost", accessorKey: "targetCost", header: "Target Cost", cell: TextCell },
    { id: "sellingPrice", accessorKey: "sellingPrice", header: "Selling Price", cell: TextCell },
    { id: "status", accessorKey: "status", header: "Status", cell: StatusCell },
    { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns: ExportColumn<Variant & Record<string, unknown>>[] = [
  { key: "categoryName", header: "Category" },
  { key: "seriesName", header: "Series" },
  { key: "modelName", header: "Model" },
  { key: "variantCode", header: "Variant Code" },
  { key: "variantName", header: "Variant Name" },
  { key: "bodyTypeName", header: "Body Type" },
  { key: "axleBrandName", header: "Axle Brand" },
  { key: "hydraulicBrandName", header: "Hydraulic Brand" },
  { key: "tyreBrandName", header: "Tyre Brand" },
  { key: "targetCost", header: "Target Cost" },
  { key: "sellingPrice", header: "Selling Price" },
  {
    key: "status",
    header: "Status",
    format: (value: unknown) => (value === "active" ? "Active" : "Inactive"),
  },
];