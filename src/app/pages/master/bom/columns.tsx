// src/pages/master/bom/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { BOMItem } from "./types";
import React from "react";

const RowActions = createRowActions<BOMItem>("bom item");

export const columns: ColumnDef<BOMItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "itemCode",
    accessorKey: "itemCode",
    header: "ITEM CODE",
    cell: TextCell,
  },
  {
    id: "itemName",
    accessorKey: "itemName",
    header: "ITEM NAME",
    cell: TextCell,
  },
  {
    id: "itemCategory",
    accessorKey: "itemCategory",
    header: "ITEM CATEGORY",
    cell: TextCell,
  },
  {
    id: "group",
    accessorKey: "group",
    header: "GROUP",
    cell: TextCell,
  },
  {
    id: "salesPrice",
    accessorKey: "salesPrice",
    header: "SALES PRICE",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return `₹${parseFloat(value || "0").toFixed(2)}`;
    },
  },
  {
    id: "actions",
    header: "ACT",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "itemCode" as const, header: "Item Code" },
  { key: "itemName" as const, header: "Item Name" },
  { key: "itemCategory" as const, header: "Item Category" },
  { key: "group" as const, header: "Group" },
  { key: "salesPrice" as const, header: "Sales Price" },
];