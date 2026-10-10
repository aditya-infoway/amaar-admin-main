import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { SalesRegister } from "./data";
import { ExportColumn } from "../shared/export";

const RowActions = createRowActions<SalesRegister>("sales register", {
  edit: false,
  delete: false,
});

export const columns: ColumnDef<SalesRegister>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "salesDate",
    accessorKey: "salesDate",
    header: "Sales Date",
    cell: TextCell,
  },
  {
    id: "terms",
    accessorKey: "terms",
    header: "Terms",
    cell: TextCell,
  },
  {
    id: "partyName",
    accessorKey: "partyName",
    header: "Party Name",
    cell: TextCell,
  },
  {
    id: "salesInvoiceNo",
    accessorKey: "salesInvoiceNo",
    header: "Sales Invoice No.",
    cell: TextCell,
  },
  {
    id: "salesOrderNo",
    accessorKey: "salesOrderNo",
    header: "Sales Order No.",
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
    id: "subTotal",
    accessorKey: "subTotal",
    header: "Sub Total",
    cell: TextCell,
  },
  {
    id: "taxableAmount",
    accessorKey: "taxableAmount",
    header: "Taxable Amount",
    cell: TextCell,
  },
  {
    id: "discountAmount",
    accessorKey: "discountAmount",
    header: "Discount",
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
  {
    id: "createdBy",
    accessorKey: "createdBy",
    header: "Created By",
    cell: TextCell,
  },
  {
    id: "createdType",
    accessorKey: "createdType",
    header: "Created Type",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<SalesRegister>[] = [
  { key: "salesDate", header: "Sales Date" },
  { key: "terms", header: "Terms" },
  { key: "partyName", header: "Party Name" },
  { key: "salesInvoiceNo", header: "Sales Invoice No." },
  { key: "salesOrderNo", header: "Sales Order No." },
  { key: "location", header: "Location" },
  { key: "totalQuantity", header: "Total Quantity" },
  { key: "subTotal", header: "Sub Total" },
  { key: "taxableAmount", header: "Taxable Amount" },
  { key: "discountAmount", header: "Discount" },
  { key: "cgstAmount", header: "CGST Amount" },
  { key: "sgstAmount", header: "SGST Amount" },
  { key: "igstAmount", header: "IGST Amount" },
  { key: "grandTotal", header: "Grand Total" },
  { key: "createdBy", header: "Created By" },
  { key: "createdType", header: "Created Type" },
  { key: "status", header: "Status" },
];