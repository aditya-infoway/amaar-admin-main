import { createElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TextCell } from "../shared/tableCells";
import { LedgerAccountRow } from "../shared/types";
import { ExportColumn } from "../shared/export";

const BalanceCell = (info: any) => {
  const row = info.row.original as LedgerAccountRow;
  const isDr = row.currentDrOrCr === "DR";
  return createElement(
    "span",
    { className: isDr ? "text-emerald-600" : "text-red-500" },
    `${Number(row.currentBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })} ${row.currentDrOrCr}`
  );
};

const EyeIcon = () =>
  createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "size-4",
    },
    createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" }),
    createElement("circle", { cx: "12", cy: "12", r: "3" })
  );

export const getLedgerColumns = (
  onView: (row: LedgerAccountRow) => void
): ColumnDef<LedgerAccountRow>[] => [
  {
    id: "srNo",
    header: "Sr No.",
    cell: (info) => info.row.index + 1,
    enableSorting: false,
  },
  { id: "accountName", accessorKey: "accountName", header: "Account Name", cell: TextCell },
  { id: "groupName", accessorKey: "groupName", header: "Group", cell: TextCell },
  { id: "addressLine1", accessorKey: "addressLine1", header: "Address", cell: TextCell },
  { id: "cityName", accessorKey: "cityName", header: "City", cell: TextCell },
  { id: "stateName", accessorKey: "stateName", header: "State", cell: TextCell },
  { id: "currentBalance", accessorKey: "currentBalance", header: "Closing Balance", cell: BalanceCell },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    cell: (info) =>
      createElement(
        "button",
        {
          onClick: () => onView(info.row.original as LedgerAccountRow),
          className: "rounded-md border p-1.5 text-slate-600 hover:bg-slate-50",
          title: "View Details",
        },
        createElement(EyeIcon)
      ),
  },
];

export const ledgerExportColumns: ExportColumn<LedgerAccountRow>[] = [
  { key: "accountName", header: "Account Name" },
  { key: "groupName", header: "Group" },
  { key: "addressLine1", header: "Address" },
  { key: "cityName", header: "City" },
  { key: "stateName", header: "State" },
  {
    key: "currentBalance",
    header: "Closing Balance",
    format: (v, row) =>
      `${Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })} ${row.currentDrOrCr}`,
  },
];