import { CellContext, ColumnDef } from "@tanstack/react-table";

import { TextCell } from "./shared/tableCells";
import { StockReportDetailRow } from "./data";
import { ExportColumn } from "./shared/export";

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

export const detailColumns: ColumnDef<StockReportDetailRow>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: formatDateCell,
  },
  { id: "partyName", accessorKey: "partyName", header: "Party Name", cell: TextCell },
  { id: "billNo", accessorKey: "billNo", header: "Bill No", cell: TextCell },
  { id: "qty", accessorKey: "qty", header: "Qty", cell: TextCell },
  { id: "billAmount", accessorKey: "billAmount", header: "Bill Amount", cell: TextCell },
  { id: "currentStock", accessorKey: "currentStock", header: "Current Stock", cell: TextCell },
];

export const detailExportColumns: ExportColumn<StockReportDetailRow>[] = [
  {
    key: "date",
    header: "Date",
    // ✅ CHANGED — export me bhi wahi dd-mm-yyyy format
    format: (value: unknown) => (value ? formatDateDDMMYYYY(value as string) : ""),
  },
  { key: "partyName", header: "Party Name" },
  { key: "billNo", header: "Bill No" },
  { key: "qty", header: "Qty" },
  { key: "billAmount", header: "Bill Amount" },
  { key: "currentStock", header: "Current Stock" },
];