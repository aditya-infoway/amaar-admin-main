// src/app/pages/grr/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { GrrItem } from "./data";
import { InQtyCell, ActionCell } from "./rows";

export const columns: ColumnDef<GrrItem>[] = [
  {
    id: "srNo",
    header: "SR No",
    cell: ({ row }) => <span className="text-center text-gray-400">{row.index + 1}</span>,
    size: 60,
  },
  {
    id: "itemCode",
    accessorKey: "itemCode",
    header: "Item Code",
    cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
  },
  {
    id: "itemName",
    accessorKey: "itemName",
    header: "Item Name",
  },
  {
    id: "orderQty",
    accessorKey: "orderQty",
    header: "Order Qty",
    cell: ({ getValue }) => <span className="text-right font-medium">{String(getValue())}</span>,
  },
  {
    id: "inQty",
    accessorKey: "inQty",
    header: "In Qty",
    cell: InQtyCell,
  },
  {
    id: "hsnCode",
    accessorKey: "hsnCode",
    header: "HSN Code",
  },
 
 
  {
    id: "action",
    header: "Action",
    cell: ActionCell,
    size: 100,
  },
];

export const differenceColumns: ColumnDef<GrrItem>[] = [
  columns[0], // srNo
  columns[1], // itemCode
  columns[2], // itemName
  columns[3], // orderQty
  {
    id: "inQty",
    accessorKey: "inQty",
    header: "In Qty",
   cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return <span className="text-right font-medium">{v ?? ""}</span>;
    },
   },

  columns[5], // hsnCode
  {
    id: "difference",
    header: "Difference",
    cell: ({ row }) => {
      const diff = row.original.orderQty - (row.original.inQty ?? 0);
      const isShort = diff > 0;
      const isExcess = diff < 0;
      return (
        <span
          className={
            isShort
              ? "text-error font-semibold"
              : isExcess
              ? "text-warning-600 dark:text-warning-400 font-semibold"
              : "text-success font-semibold"
          }
        >
          {diff === 0 ? "0" : isShort ? `${diff}` : `+${Math.abs(diff)}`}
        </span>
      );
    },
  },
];