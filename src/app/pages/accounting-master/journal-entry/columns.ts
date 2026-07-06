import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { JournalEntry } from "../shared/types";

const RowActions = createRowActions<JournalEntry>("journalEntry");

export const columns: ColumnDef<JournalEntry>[] = [
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
    id: "drAccount",
    accessorKey: "drAccount",
    header: "Debit (Dr.) Account",
    cell: TextCell,
  },
  {
    id: "crAccount",
    accessorKey: "crAccount",
    header: "Credit (Cr.) Account",
    cell: TextCell,
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    cell: TextCell,
  },

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

export const exportColumns: ExportColumn<JournalEntry>[] = [
  { key: "voucherNo", header: "Voucher No" },
  { key: "drAccount", header: "Debit (Dr.) Account" },
  { key: "crAccount", header: "Credit (Cr.) Account" },
  { key: "amount", header: "Amount" },
  { key: "type", header: "Type" },
  {
    key: "date",
    header: "Date",
    format: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : "",
  },
];