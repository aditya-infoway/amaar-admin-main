import { ColumnDef } from "@tanstack/react-table";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../master/shared/createRowActions";
import { TextCell } from "../master/shared/tableCells";
import { ItemMaster } from "./data";
import { ExportColumn } from "../master/shared/export";

const RowActions = createRowActions<ItemMaster>("item");

export const columns: ColumnDef<ItemMaster>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "itemCode", accessorKey: "itemCode", header: "Item Code", cell: TextCell },
  { id: "itemName", accessorKey: "itemName", header: "Item Name", cell: TextCell },
  { id: "shortName", accessorKey: "shortName", header: "Short Name", cell: TextCell },
  { id: "categoryName", accessorKey: "categoryName", header: "Item Category", cell: TextCell },
  { id: "groupName", accessorKey: "groupName", header: "Group", cell: TextCell },
  { id: "salesPrice", accessorKey: "salesPrice", header: "Sales Price", cell: TextCell },
  { id: "mrp", accessorKey: "mrp", header: "MRP", cell: TextCell },
  { id: "barcode", accessorKey: "barcode", header: "Barcode", cell: TextCell },
  { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
];

export const exportColumns: ExportColumn<ItemMaster>[] = [
  { key: "itemCode", header: "Item Code" },
  { key: "itemName", header: "Item Name" },
  { key: "shortName", header: "Short Name" },
  { key: "categoryName", header: "Item Category" },
  { key: "groupName", header: "Group" },
  { key: "salesPrice", header: "Sales Price" },
  { key: "mrp", header: "MRP" },
  { key: "barcode", header: "Barcode" },
];