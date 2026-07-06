import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { BankReceipt } from "../shared/types";

const RowActions = createRowActions<BankReceipt>("bankReceipt");

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
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<BankReceipt>[] = [
  { key: "voucherNo", header: "Voucher No" },
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