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
import { Quotation } from "../shared/types";
import { printQuotationHtml } from "./printQuotation";

const RowActions = createRowActions<Quotation>("quotation");

export interface CreateMasterOption {
  createMasterId: number;
  type: string;
  description: string;
}

const getMasterDescription = (
  createMasterOptions: CreateMasterOption[],
  value: unknown,
) => {
  const master = createMasterOptions.find(
    (item) => Number(item.createMasterId) === Number(value),
  );

  return master?.description || "—";
};

export function createColumns(
  createMasterOptions: CreateMasterOption[],
): ColumnDef<Quotation>[] {
  return [
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

    // =========================
    // CREATE MASTER FIELDS
    // =========================

      {
      id: "body",
      accessorKey: "body",
      header: "Body",
      cell: (info) =>
        getMasterDescription(createMasterOptions, info.getValue()),
    },
    {
      id: "kingPin",
      accessorKey: "kingPin",
      header: "King Pin",
      cell: (info) =>
        getMasterDescription(createMasterOptions, info.getValue()),
    },
    {
      id: "box",
      accessorKey: "box",
      header: "Tool Box",
      cell: (info) =>
        getMasterDescription(createMasterOptions, info.getValue()),
    },
    {
      id: "chassis",
      accessorKey: "chassis",
      header: "Chassis",
      cell: (info) =>
        getMasterDescription(createMasterOptions, info.getValue()),
    },
    {
      id: "hydraulic",
      accessorKey: "hydraulic",
      header: "Hydraulic",
      cell: (info) =>
        getMasterDescription(createMasterOptions, info.getValue()),
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
}

export function createExportColumns(
  createMasterOptions: CreateMasterOption[],
): ExportColumn<Quotation>[] {
  return [
    { key: "qNo", header: "Q.No" },
    { key: "customerName", header: "Customer Name" },
    { key: "mobile", header: "Mobile No" },
    { key: "city", header: "City" },

       {
      key: "body",
      header: "Body",
      format: (value: unknown) =>
        getMasterDescription(createMasterOptions, value),
    },
    {
      key: "kingPin",
      header: "King Pin",
      format: (value: unknown) =>
        getMasterDescription(createMasterOptions, value),
    },
    {
      key: "box",
      header: "Tool Box",
      format: (value: unknown) =>
        getMasterDescription(createMasterOptions, value),
    },
    {
      key: "chassis",
      header: "Chassis",
      format: (value: unknown) =>
        getMasterDescription(createMasterOptions, value),
    },
    {
      key: "hydraulic",
      header: "Hydraulic",
      format: (value: unknown) =>
        getMasterDescription(createMasterOptions, value),
    },

    { key: "finalPrice", header: "Final Price" },
    { key: "createdBy", header: "Created By" },
  ];
}
