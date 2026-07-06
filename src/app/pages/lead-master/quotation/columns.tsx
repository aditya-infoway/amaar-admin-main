import { ColumnDef } from "@tanstack/react-table";
import { PrinterIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Button } from "@/components/ui";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Quotation } from "./data";
import {
  tyreOptions,
  axleOptions,
  boxOptions,
  chassisOptions,
  hydraulicOptions,
  getOptionLabel,
} from "./options";
import { printQuotationHtml } from "./printQuotation";

const RowActions = createRowActions<Quotation>("quotation");

export const columns: ColumnDef<Quotation>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "qNo",
    accessorKey: "qNo",
    header: "Q.No",
    cell: TextCell,
  },
  {
    id: "customerName",
    accessorKey: "customerName",
    header: "Customer Name",
    cell: TextCell,
  },
  {
    id: "mobile",
    accessorKey: "mobile",
    header: "Mobile No",
    cell: TextCell,
  },
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    cell: TextCell,
  },
  {
    id: "tyre",
    accessorKey: "tyre",
    header: "Tyre",
    cell: (info) => getOptionLabel(tyreOptions, info.getValue<string>()),
  },
  {
    id: "axle",
    accessorKey: "axle",
    header: "Exel",
    cell: (info) => getOptionLabel(axleOptions, info.getValue<string>()),
  },
  {
    id: "box",
    accessorKey: "box",
    header: "Box",
    cell: (info) => getOptionLabel(boxOptions, info.getValue<string>()),
  },
  {
    id: "chassis",
    accessorKey: "chassis",
    header: "Chassis",
    cell: (info) => getOptionLabel(chassisOptions, info.getValue<string>()),
  },
  {
    id: "hydraulic",
    accessorKey: "hydraulic",
    header: "Hydraulic",
    cell: (info) => getOptionLabel(hydraulicOptions, info.getValue<string>()),
  },
  {
    id: "finalPrice",
    accessorKey: "finalPrice",
    header: "Final Price",
    cell: (info) =>
      `₹ ${Number(info.getValue<string>() || 0).toLocaleString("en-IN")}`,
  },
  {
    id: "createdBy",
    accessorKey: "createdBy",
    header: "Created By",
    cell: TextCell,
  },
  {
    id: "position",
    accessorKey: "position",
    header: "Position",
    cell: TextCell,
  },
  {
    id: "print",
    header: "Print",
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        variant="flat"
        isIcon
        className="size-7 rounded-full"
        onClick={() => printQuotationHtml(row.original)}
        title="View / Print Quotation"
      >
        <PrinterIcon className="size-4.5" />
      </Button>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Quotation>[] = [
  { key: "qNo", header: "Q.No" },
  { key: "customerName", header: "Customer Name" },
  { key: "mobile", header: "Mobile No" },
  { key: "city", header: "City" },
  {
    key: "tyre",
    header: "Tyre",
    format: (v: unknown) => getOptionLabel(tyreOptions, v as string),
  },
  {
    key: "axle",
    header: "Exel",
    format: (v: unknown) => getOptionLabel(axleOptions, v as string),
  },
  {
    key: "box",
    header: "Box",
    format: (v: unknown) => getOptionLabel(boxOptions, v as string),
  },
  {
    key: "chassis",
    header: "Chassis",
    format: (v: unknown) => getOptionLabel(chassisOptions, v as string),
  },
  {
    key: "hydraulic",
    header: "Hydraulic",
    format: (v: unknown) => getOptionLabel(hydraulicOptions, v as string),
  },
  { key: "finalPrice", header: "Final Price" },
  { key: "createdBy", header: "Created By" },
  { key: "position", header: "Position" },
];