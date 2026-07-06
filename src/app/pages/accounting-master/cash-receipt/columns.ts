import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { CashReceipt } from "../shared/types";

const RowActions = createRowActions<CashReceipt>("cashReceipt");

export const columns: ColumnDef<CashReceipt>[] = [
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
    id: "cashAccount",
    accessorKey: "cashAccount",
    header: "Cash Account",
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
  //   id: "receiptMode",
  //   accessorKey: "receiptMode",
  //   header: "Mode",
  //   cell: (info) => <span className="uppercase">{info.getValue<string>()}</span>,
  // },
  {
  id: "receiptMode",
  accessorKey: "receiptMode",
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

export const exportColumns: ExportColumn<CashReceipt>[] = [
  { key: "voucherNo", header: "Voucher No" },
  { key: "cashAccount", header: "Cash Account" },
  { key: "oppAccount", header: "Opp. Account" },
  { key: "amount", header: "Amount" },
  { key: "receiptMode", header: "Mode" },
  {
    key: "date",
    header: "Date",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
];