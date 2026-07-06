import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { PurchaseRegister } from "./data";

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
    id: "freightInsuranceOtherCharges",
    accessorKey: "freightInsuranceOtherCharges",
    header: "Freight + Insurance + Other",
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
    id: "transportName",
    accessorKey: "transportName",
    header: "Transport Name",
    cell: TextCell,
  },
  {
    id: "mobileNo",
    accessorKey: "mobileNo",
    header: "Mobile No.",
    cell: TextCell,
  },
  {
    id: "vehicleNo",
    accessorKey: "vehicleNo",
    header: "Vehicle No.",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
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
  { key: "purchaseDate" as const, header: "Purchase Date" },
  { key: "terms" as const, header: "Terms" },
  { key: "supplierName" as const, header: "Supplier Name" },
  { key: "billNo" as const, header: "Bill No." },
  { key: "purchaseBillNo" as const, header: "Purchase Bill No." },
  { key: "location" as const, header: "Location" },
  { key: "totalQuantity" as const, header: "Total Quantity" },
  { key: "totalAmount" as const, header: "Total Amount" },
  { key: "freightInsuranceOtherCharges" as const, header: "Freight + Insurance + Other Charges" },
  { key: "cgstAmount" as const, header: "CGST Amount" },
  { key: "sgstAmount" as const, header: "SGST Amount" },
  { key: "igstAmount" as const, header: "IGST Amount" },
  { key: "grandTotal" as const, header: "Grand Total" },
  { key: "transportName" as const, header: "Transport Name" },
  { key: "mobileNo" as const, header: "Mobile No." },
  { key: "vehicleNo" as const, header: "Vehicle No." },
  { key: "status" as const, header: "Status" },
];