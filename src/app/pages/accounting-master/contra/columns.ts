import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Contra } from "../shared/types";

const RowActions = createRowActions<Contra>("contra");

export const columns: ColumnDef<Contra>[] = [
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
    id: "account",
    accessorKey: "account",
    header: "Cash/Bank Account",
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
  //   id: "type",
  //   accessorKey: "type",
  //   header: "Type",
  //   cell: (info) => <span className="capitalize">{info.getValue<string>()}</span>,
  // },
  {
  id: "type",
  accessorKey: "type",
  header: "type",
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

export const exportColumns: ExportColumn<Contra>[] = [
  { key: "voucherNo", header: "Voucher No" },
  { key: "account", header: "Cash/Bank Account" },
  { key: "oppAccount", header: "Opp. Account" },
  { key: "amount", header: "Amount" },
  { key: "type", header: "Type" },
  {
    key: "date",
    header: "Date",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
];