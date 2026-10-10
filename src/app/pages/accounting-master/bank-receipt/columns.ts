import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
// import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { BankReceipt } from "../shared/types";

// const RowActions = createRowActions<BankReceipt>("bankReceipt");
import { createElement } from "react";
import { CellContext } from "@tanstack/react-table";
const TYPE_BADGE_STYLES: Record<string, string> = {
  BR: "bg-indigo-100 text-indigo-700",
  SIBR: "bg-amber-100 text-amber-700",
  // naya code aaye to yahin ek line add karo
};

const TypeCell = (info: CellContext<BankReceipt, unknown>) => {
  const type = info.getValue<string>() || "—";
  const style = TYPE_BADGE_STYLES[type] || "bg-slate-100 text-slate-700";

  return createElement(
    "span",
    { className: `rounded-full px-2 py-0.5 text-xs font-medium ${style}` },
    type
  );
};
export const columns: ColumnDef<BankReceipt>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "voucherNo",
    accessorKey: "voucherNo",
    header: "Voucher No",
    cell: TextCell,
  },
    {
    id: "type",
    accessorKey: "type",
    header: "Type",
    cell: TypeCell,
    enableSorting: false,
  },
  {
    id: "bankAccount",
    accessorKey: "bankAccount",
    header: "Bank Account",
    cell: TextCell,
  },
  {
    id: "oppAccount",
    accessorKey: "oppAccount",
    header: "Opp. Account",
    cell: TextCell,
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    cell: TextCell,
  },
  // {
  //   id: "transactionMode",
  //   accessorKey: "transactionMode",
  //   header: "Mode",
  //   cell: (info) => <span className="uppercase">{info.getValue<string>()}</span>,
  // },
  {
  id: "transactionMode",
  accessorKey: "transactionMode",
  header: "Mode",
  cell: (info) => String(info.getValue() ?? "").toUpperCase(),
},
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: (info) => {
      const value = info.getValue<string>();
      return value ? new Date(value).toLocaleDateString() : "—";
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: RowActions,
  //   enableSorting: false,
  // },
];

export const exportColumns: ExportColumn<BankReceipt>[] = [
  { key: "voucherNo", header: "Voucher No" },
  { key: "type", header: "Type" },
  { key: "bankAccount", header: "Bank Account" },
  { key: "oppAccount", header: "Opp. Account" },
  { key: "amount", header: "Amount" },
  { key: "transactionMode", header: "Mode" },
  {
    key: "date",
    header: "Date",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
];