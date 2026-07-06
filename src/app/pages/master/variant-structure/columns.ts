import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { VariantStructure } from "./data";

const RowActions = createRowActions<VariantStructure>("variant structure");

export const columns: ColumnDef<VariantStructure>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "variantCode",
    accessorKey: "variantCode",
    header: "Variant Code",
    cell: TextCell,
  },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: "Category Name",
    cell: TextCell,
  },
  {
    id: "seriesName",
    accessorKey: "seriesName",
    header: "Series Name",
    cell: TextCell,
  },
  {
    id: "modelName",
    accessorKey: "modelName",
    header: "Model Name",
    cell: TextCell,
  },
  {
    id: "bodyType",
    accessorKey: "bodyType",
    header: "Body Type",
    cell: TextCell,
  },
  {
    id: "targetCost",
    accessorKey: "targetCost",
    header: "Target Cost",
    cell: TextCell,
  },
  {
    id: "sellingMarkup",
    accessorKey: "sellingMarkup",
    header: "Selling Markup",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "variantCode" as const, header: "Variant Code" },
  { key: "categoryCode" as const, header: "Category Code" },
  { key: "categoryName" as const, header: "Category Name" },
  { key: "seriesCode" as const, header: "Series Code" },
  { key: "seriesName" as const, header: "Series Name" },
  { key: "modelCode" as const, header: "Model Code" },
  { key: "modelName" as const, header: "Model Name" },
  { key: "capacity" as const, header: "Capacity" },
  { key: "axleType" as const, header: "Axle Type" },
  { key: "bodyLength" as const, header: "Body Length" },
  { key: "bodyWidth" as const, header: "Body Width" },
  { key: "bodyHeight" as const, header: "Body Height" },
  { key: "standardWeight" as const, header: "Standard Weight" },
  { key: "bodyType" as const, header: "Body Type" },
  { key: "axleBrand" as const, header: "Axle Brand" },
  { key: "hydraulicBrand" as const, header: "Hydraulic Brand" },
  { key: "tyreBrand" as const, header: "Tyre Brand" },
  { key: "targetCost" as const, header: "Target Cost" },
  { key: "sellingMarkup" as const, header: "Selling Markup" },
];
