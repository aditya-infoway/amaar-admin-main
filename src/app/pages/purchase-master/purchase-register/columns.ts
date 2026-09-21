import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { PurchaseRegister } from "./data";
import { ExportColumn } from "../shared/export";
const RowActions = createRowActions<PurchaseRegister>("purchase register");

export const columns: ColumnDef<PurchaseRegister>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "purchaseDate",
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    cell: TextCell,
  },
  {
    id: "terms",
    accessorKey: "terms",
    header: "Terms",
    cell: TextCell,
  },
  {
    id: "supplierName",
    accessorKey: "supplierName",
    header: "Supplier Name",
    cell: TextCell,
  },
  {
    id: "billNo",
    accessorKey: "billNo",
    header: "Bill No.",
    cell: TextCell,
  },
  {
    id: "purchaseBillNo",
    accessorKey: "purchaseBillNo",
    header: "Purchase Bill No.",
    cell: TextCell,
  },
  {
    id: "location",
    accessorKey: "location",
    header: "Location",
    cell: TextCell,
  },
  {
    id: "totalQuantity",
    accessorKey: "totalQuantity",
    header: "Total Quantity",
    cell: TextCell,
  },
  {
    id: "totalAmount",
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: TextCell,
  },
  {
    id: "transportLoadingOtherCharge",
    accessorKey: "transportLoadingOtherCharge",
    header: "Transport + Loading + Other",
    cell: TextCell,
  },
  {
    id: "cgstAmount",
    accessorKey: "cgstAmount",
    header: "CGST Amount",
    cell: TextCell,
  },
  {
    id: "sgstAmount",
    accessorKey: "sgstAmount",
    header: "SGST Amount",
    cell: TextCell,
  },
  {
    id: "igstAmount",
    accessorKey: "igstAmount",
    header: "IGST Amount",
    cell: TextCell,
  },
  {
    id: "grandTotal",
    accessorKey: "grandTotal",
    header: "Grand Total",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: TextCell,
  },
   { id: "createdBy", accessorKey: "createdBy", header: "Created By", cell: TextCell },
  { id: "createdType", accessorKey: "createdType", header: "Created Type", cell: TextCell }, 
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<PurchaseRegister>[] = [
  { key: "purchaseDate", header: "Purchase Date" },
  { key: "terms", header: "Terms" },
  { key: "supplierName", header: "Supplier Name" },
  { key: "billNo", header: "Bill No." },
  { key: "purchaseBillNo", header: "Purchase Bill No." },
  { key: "location", header: "Location" },
  { key: "totalQuantity", header: "Total Quantity" },
  { key: "totalAmount", header: "Total Amount" },
  {
    key: "transportLoadingOtherCharge",
    header: "Transport + Loading + Other Charges",
  },
  { key: "cgstAmount", header: "CGST Amount" },
  { key: "sgstAmount", header: "SGST Amount" },
  { key: "igstAmount", header: "IGST Amount" },
  { key: "grandTotal", header: "Grand Total" },
  { key: "createdBy", header: "Created By" },
  { key: "createdType", header: "Created Type" },
  { key: "status", header: "Status" },
];