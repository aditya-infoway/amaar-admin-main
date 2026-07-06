import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../master/shared/createRowActions";
import { TextCell } from "../master/shared/tableCells";
import { ItemMaster } from "./data";

const RowActions = createRowActions<ItemMaster>("item");

export function createColumns(
  getLabel: (options: { id: string; label: string }[], id: string) => string,
  itemCategoryOptions: { id: string; label: string }[],
  itemTypeOptions: { id: string; label: string }[],
): ColumnDef<ItemMaster>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "itemCode", accessorKey: "itemCode", header: "Item Code", cell: TextCell },
    { id: "itemName", accessorKey: "itemName", header: "Item Name", cell: TextCell },
    { id: "shortName", accessorKey: "shortName", header: "Short Name", cell: TextCell },
    {
      id: "itemCategory",
      accessorFn: (row) => getLabel(itemCategoryOptions, row.itemCategory),
      header: "Item Category",
      cell: TextCell,
    },
    {
      id: "itemType",
      accessorFn: (row) => getLabel(itemTypeOptions, row.itemType),
      header: "Item Type",
      cell: TextCell,
    },
    { id: "salesPrice", accessorKey: "salesPrice", header: "Sales Price", cell: TextCell },
    { id: "mrp", accessorKey: "mrp", header: "MRP", cell: TextCell },
    { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
  ];
}

export const exportColumns = [
  { key: "itemCode" as const, header: "Item Code" },
  { key: "itemName" as const, header: "Item Name" },
  { key: "shortName" as const, header: "Short Name" },
  { key: "itemCategoryLabel" as const, header: "Item Category" },
  { key: "itemTypeLabel" as const, header: "Item Type" },
  { key: "salesPrice" as const, header: "Sales Price" },
  { key: "mrp" as const, header: "MRP" },
];
