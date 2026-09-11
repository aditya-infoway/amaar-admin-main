// Import Dependencies
import { ColumnDef } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  AvailableStockCell,
  CategoryCell,
  LocationCell,
  NameCell,
  PurchaseOrderCell,
  RequiredStockCell,
  UnitCell,
} from "./rows";
import { MaterialItem } from "./data";

// ----------------------------------------------------------------------

export const columns: ColumnDef<MaterialItem>[] = [
  {
    id: "select",
    label: "Row Selection",
    header: SelectHeader,
    cell: SelectCell,
  },
  {
    id: "name",
    accessorKey: "name",
    label: "Name",
    header: "Name",
    cell: NameCell,
  },
  {
  id: "item_code",
  accessorKey: "item_code",
  label: "Item Code",
  header: "Item Code",
  cell: "ItemCode",
},
  {
    id: "item_location",
    accessorKey: "item_location",
    label: "Item Location",
    header: "Item Location",
    cell: LocationCell,
  },
  {
    id: "category",
    accessorKey: "category",
    label: "Category",
    header: "Category",
    cell: CategoryCell,
  },
  {
    id: "unit",
    accessorKey: "unit",
    label: "Unit",
    header: "Unit",
    cell: UnitCell,
  },
  {
    id: "available_stock",
    accessorKey: "available_stock",
    label: "Available Stock",
    header: "Available Stock",
    cell: AvailableStockCell,
    filterColumn: "numberRange",
    filterFn: "inNumberRange",
  },
  {
    id: "required_stock",
    accessorKey: "required_stock",
    label: "Required Stock",
    header: "Required Stock",
    cell: RequiredStockCell,
    filterColumn: "numberRange",
    filterFn: "inNumberRange",
  },
  {
    id: "purchase_order",
    accessorKey: "purchase_order",
    label: "Purchase Order",
    header: "Purchase Order",
    cell: PurchaseOrderCell,
  },
  {
    id: "actions",
    label: "Row Actions",
    header: "Actions",
    cell: RowActions,
  },
];