import { CellContext, ColumnDef } from "@tanstack/react-table";

import { TextCell } from "./shared/tableCells";
import { StockReportDetailRow } from "./data";
import { ExportColumn } from "./shared/export";
import { createElement } from "react";

// ✅ NEW — dd-mm-yyyy format helper, locale-independent
function formatDateDDMMYYYY(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ✅ CHANGED — ab fixed dd-mm-yyyy format use hota hai locale ke bajaye
function formatDateCell(info: CellContext<StockReportDetailRow, unknown>) {
  const value = info.getValue() as string;
  return value ? formatDateDDMMYYYY(value) : "—";
}

function TypeBadgeCell(info: CellContext<StockReportDetailRow, unknown>) {
  const value = (info.getValue() as string) || "";
  const t = value.toLowerCase();
  const color =
    t === "purchase"
      ? "bg-green-100 text-green-800"
      : t === "opening"
        ? "bg-blue-100 text-blue-800"
        : t.includes("sales")
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-800";
  return createElement(
    "span",
    {
      className: `inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`,
    },
    value || "—",
  );
}

export const detailColumns: ColumnDef<StockReportDetailRow>[] = [
  {
    id: "srNo",
    header: "Sr. No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: formatDateCell,
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Type",
    cell: TypeBadgeCell,
  },
  {
    id: "voucherNo",
    accessorKey: "voucherNo",
    header: "Voucher No",
    cell: TextCell,
  },
  {
    id: "partyName",
    accessorKey: "partyName",
    header: "Party Name",
    cell: TextCell,
  },

  { id: "qtyIn", accessorKey: "qtyIn", header: "Qty In", cell: TextCell },
  { id: "qtyOut", accessorKey: "qtyOut", header: "Qty Out", cell: TextCell },
  {
    id: "physicalStock",
    accessorKey: "physicalStock",
    header: "Physical Stock",
    cell: TextCell,
  },
  {
    id: "reservedStock",
    header: "Reserved Stock",
    columns: [
      {
        id: "reservedQty",
        accessorKey: "reservedQty",
        header: "Reserve",
        cell: TextCell,
      },
      {
        id: "reservedTotal",
        accessorKey: "reservedTotal",
        header: "Total",
        cell: TextCell,
      },
    ],
  },
  {
    id: "availableStock",
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: TextCell,
  },
];

export const detailExportColumns: ExportColumn<StockReportDetailRow>[] = [
  {
    key: "date",
    header: "Date",
    // ✅ CHANGED — export me bhi wahi dd-mm-yyyy format
    format: (value: unknown) =>
      value ? formatDateDDMMYYYY(value as string) : "",
  },
  { key: "type", header: "Type" },
  { key: "voucherNo", header: "Voucher No" },
  { key: "partyName", header: "Party Name" },
  { key: "qtyIn", header: "Qty In" },
  { key: "qtyOut", header: "Qty Out" },
  { key: "physicalStock", header: "Physical Stock" },
  { key: "reservedQty", header: "Reserve" },
  { key: "reservedTotal", header: "Reserved Total" },
  { key: "availableStock", header: "Available Stock" },
];
