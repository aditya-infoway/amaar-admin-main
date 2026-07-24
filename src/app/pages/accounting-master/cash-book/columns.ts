import { createElement } from "react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { formatDateDDMMYYYY } from "@/ApiHelper";

import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { CashBookRow } from "../shared/types";

// Badge colors keyed off whatever code is stored in paymentCollectedByModules.
// Add an entry whenever a new module starts writing its own code
// ("LCR", "JCR", "DCR", "RFCP", "CPPP", "PCP", ...) — unknown codes fall
// back to the default gray pill so nothing breaks if a code isn't listed yet.
const TYPE_BADGE_STYLES: Record<string, string> = {
  CP: "bg-slate-100 text-slate-700",
  CR: "bg-emerald-100 text-emerald-700",
  BP: "bg-sky-100 text-sky-700",
  BR: "bg-indigo-100 text-indigo-700",
};

const TypeCell = (info: CellContext<CashBookRow, unknown>) => {
  const type = info.getValue<string>();

  const style =
    TYPE_BADGE_STYLES[type] || "bg-slate-100 text-slate-700";

  return createElement(
    "span",
    {
      className: `rounded-full px-2 py-0.5 text-xs font-medium ${style}`,
    },
    type
  );
};

const ReceiptCell = (info: CellContext<CashBookRow, unknown>) =>
  createElement(
    "span",
    { className: "text-emerald-600" },
    `₹${Number(info.getValue()).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`
  );

const PaymentCell = (info: CellContext<CashBookRow, unknown>) =>
  createElement(
    "span",
    { className: "text-red-500" },
    `₹${Number(info.getValue()).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`
  );

export const columns: ColumnDef<CashBookRow>[] = [
  { id: "sr", accessorKey: "sr", header: "SR", cell: TextCell, enableSorting: false },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDateDDMMYYYY(info.getValue<string>()),
  },
  { id: "voucherNo", accessorKey: "voucherNo", header: "Voucher No.", cell: TextCell },
  { id: "type", accessorKey: "type", header: "Type", cell: TypeCell, enableSorting: false },
  { id: "accountName", accessorKey: "accountName", header: "Account Name", cell: TextCell },
  { id: "partyName", accessorKey: "partyName", header: "Party Name", cell: TextCell },
  { id: "receipt", accessorKey: "receipt", header: "Receipt (₹)", cell: ReceiptCell },
  { id: "payment", accessorKey: "payment", header: "Payment (₹)", cell: PaymentCell },
  { id: "narration", accessorKey: "narration", header: "Narration", cell: TextCell },
  { id: "createdBy", accessorKey: "createdBy", header: "Created By", cell: TextCell },
  { id: "createdType", accessorKey: "createdType", header: "Created Type", cell: TextCell },
];

export const exportColumns: ExportColumn<CashBookRow>[] = [
  { key: "voucherNo", header: "Voucher No" },
  { key: "date", header: "Date", format: (value: unknown) => formatDateDDMMYYYY(value as string) },
  { key: "type", header: "Type" },
  { key: "accountName", header: "Account Name" },
  { key: "partyName", header: "Party Name" },
  { key: "receipt", header: "Receipt" },
  { key: "payment", header: "Payment" },
  { key: "narration", header: "Narration" },
  { key: "createdBy", header: "Created By" },
  { key: "createdType", header: "Created Type" },
];