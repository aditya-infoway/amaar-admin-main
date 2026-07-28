import { createElement } from "react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { formatDateDDMMYYYY } from "@/ApiHelper";

import { TextCell } from "../../shared/tableCells";
import { ExportColumn } from "../../shared/export";
import { LedgerDetailRow } from "../../shared/types";

const DebitCell = (info: CellContext<LedgerDetailRow, unknown>) => {
  const value = info.getValue<string>();
  if (!value) return createElement("span", { className: "text-slate-400" }, "—");
  return createElement(
    "span",
    { className: "text-emerald-600 font-medium" },
    Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })
  );
};

const CreditCell = (info: CellContext<LedgerDetailRow, unknown>) => {
  const value = info.getValue<string>();
  if (!value) return createElement("span", { className: "text-slate-400" }, "—");
  return createElement(
    "span",
    { className: "text-amber-600 font-medium" },
    Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })
  );
};

const BalanceCell = (info: CellContext<LedgerDetailRow, unknown>) => {
  const value = info.getValue<string>();
  const isDr = value?.endsWith("DR");
  return createElement(
    "span",
    { className: `font-semibold ${isDr ? "text-primary" : "text-red-500"}` },
    value
  );
};

const TypeCell = (info: CellContext<LedgerDetailRow, unknown>) =>
  createElement(
    "span",
    { className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700" },
    info.getValue<string>()
  );

export const ledgerDetailColumns: ColumnDef<LedgerDetailRow>[] = [
  { id: "sr", accessorKey: "sr", header: "#", cell: TextCell, enableSorting: false },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDateDDMMYYYY(info.getValue<string>()),
  },
  { id: "voucherNo", accessorKey: "voucherNo", header: "Voucher", cell: TextCell },
  { id: "type", accessorKey: "type", header: "Type", cell: TypeCell, enableSorting: false },
  { id: "particulars", accessorKey: "particulars", header: "Particulars", cell: TextCell },
  { id: "debit", accessorKey: "debit", header: "Debit", cell: DebitCell },
  { id: "credit", accessorKey: "credit", header: "Credit", cell: CreditCell },
  { id: "balance", accessorKey: "balance", header: "Balance", cell: BalanceCell, enableSorting: false },
];

export const ledgerDetailExportColumns: ExportColumn<LedgerDetailRow>[] = [
  { key: "date", header: "Date", format: (v) => formatDateDDMMYYYY(v as string) },
  { key: "voucherNo", header: "Voucher" },
  { key: "type", header: "Type" },
  { key: "particulars", header: "Particulars" },
  { key: "debit", header: "Debit" },
  { key: "credit", header: "Credit" },
  { key: "balance", header: "Balance" },
];