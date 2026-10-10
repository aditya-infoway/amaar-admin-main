import { createElement } from "react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
// import { TrashIcon } from "@heroicons/react/24/outline";
import { formatDateDDMMYYYY } from "@/ApiHelper";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
// import { Button } from "@/components/ui";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { CashPayment } from "../shared/types";

// const RowActions = ({ row, table }: any) =>
//   createElement(
//     "div",
//     { className: "flex items-center gap-2" },
//     createElement(
//       Button,
//       {
//         isIcon: true,
//         variant: "flat",
//         className: "size-7 rounded-full",
//         onClick: () => (table.options.meta as any)?.deleteRow?.(row),
//         title: "Delete",
//       },
//       createElement(TrashIcon, { className: "size-4" }),
//     ),
//   );

const TYPE_BADGE_STYLES: Record<string, string> = {
  CP: "bg-rose-100 text-rose-700",
  PCP: "bg-violet-100 text-violet-700",
};

const TypeCell = (info: CellContext<CashPayment, unknown>) => {
  const type = info.getValue<string>() || "—";
  const style = TYPE_BADGE_STYLES[type] || "bg-slate-100 text-slate-700";

  return createElement(
    "span",
    { className: `rounded-full px-2 py-0.5 text-xs font-medium ${style}` },
    type
  );
};
export const columns: ColumnDef<CashPayment>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "voucherNo", accessorKey: "voucherNo", header: "Voucher No", cell: TextCell },
   { id: "type", accessorKey: "type", header: "Type", cell: TypeCell, enableSorting: false },
  { id: "cashAccount", accessorKey: "cashAccount", header: "Cash Account", cell: TextCell },
  { id: "oppAccount", accessorKey: "oppAccount", header: "Opp. Account", cell: TextCell },
  { id: "amount", accessorKey: "amount", header: "Amount", cell: TextCell },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDateDDMMYYYY(info.getValue<string>()),  // 👈 change yaha
  },
  {
    id: "createdBy",
    accessorKey: "createdBy",
    header: "Created By",
    cell: TextCell,
  },
  {
    id: "createdType",
    accessorKey: "createdType",
    header: "Created Type",
    cell: TextCell,
  },
  // { id: "actions", header: "Actions", cell: RowActions, enableSorting: false },
];

export const exportColumns: ExportColumn<CashPayment>[] = [
  { key: "voucherNo", header: "Voucher No" },
    { key: "type", header: "Type" },
  { key: "cashAccount", header: "Cash Account" },
  { key: "oppAccount", header: "Opp. Account" },
  { key: "amount", header: "Amount" },
  {
    key: "date",
    header: "Date",
    format: (value: unknown) => formatDateDDMMYYYY(value as string),
  },
  { key: "createdBy", header: "Created By" },
  { key: "createdType", header: "Created Type" },
];