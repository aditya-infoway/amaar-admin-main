import { createElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "./shared/tableCells";
import { StockReportItem } from "./data";
import { ExportColumn } from "./shared/export";

function ViewActionCell({ row, table }: any) {
  const meta = table.options.meta as any;
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => meta?.viewRow?.(row.original),
      className:
        "btn-base btn shrink-0 p-0 bg-gray-150 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200/80 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 dark:focus:bg-surface-1 dark:active:bg-surface-1/90 size-8 rounded-full",
      title: "View stock history",
    },
    createElement(EyeIcon, { className: "size-5" }),
  );
}

export const columns: ColumnDef<StockReportItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "itemCode",
    accessorKey: "itemCode",
    header: "Item Code",
    cell: TextCell,
  },
  {
    id: "itemName",
    accessorKey: "itemName",
    header: "Item Name",
    cell: TextCell,
  },
  { id: "hsnCode", accessorKey: "hsnCode", header: "HSN", cell: TextCell },
  { id: "unit", accessorKey: "unit", header: "Unit", cell: TextCell },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: "Category",
    cell: TextCell,
  },
  {
    id: "groupName",
    accessorKey: "groupName",
    header: "Group",
    cell: TextCell,
  },
  { id: "minQty", accessorKey: "minQty", header: "Min Qty", cell: TextCell },
  { id: "maxQty", accessorKey: "maxQty", header: "Max Qty", cell: TextCell },
//   {
//     id: "actions",
//     header: "Actions",
//     cell: ViewActionCell,
//     enableSorting: false,
//   },
];

export const exportColumns: ExportColumn<StockReportItem>[] = [
  { key: "itemCode", header: "Item Code" },
  { key: "itemName", header: "Item Name" },
  { key: "hsnCode", header: "HSN" },
  { key: "unit", header: "Unit" },
  { key: "categoryName", header: "Category" },
  { key: "groupName", header: "Group" },
  { key: "minQty", header: "Min Qty" },
  { key: "maxQty", header: "Max Qty" },
];
