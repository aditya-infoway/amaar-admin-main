// src/pages/body-register/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { TextCell } from "../shared/tableCells";
import { PencilSquareIcon, EyeIcon } from "@heroicons/react/24/outline";
import { WorkOrderRow, TabKey } from "./data";

export const columns: ColumnDef<WorkOrderRow>[] = [
  {
    id: "srNo",
    header: "SR No",
    cell: ({ row }) => (
      <span className="text-center text-gray-400">{row.index + 1}</span>
    ),
    size: 60,
  },
  {
    id: "workOrderDate",
    accessorKey: "workOrderDate",
    header: "Work Order Date",
    cell: TextCell,
  },

  { accessorKey: "workOrderNo", header: "Work Order No" },
  { accessorKey: "partyName", header: "Party Name" },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "model", header: "Model" },
  { accessorKey: "type", header: "Type" },
  {
    id: "action",
    header: "Action",
    cell: ({ row, table }) => {
      const item = row.original as WorkOrderRow;
      const meta = table.options.meta as {
        tab: TabKey;
        openDrawer: (row: WorkOrderRow) => void;
        openView: (row: WorkOrderRow) => void;
      };

      if (item.type !== "Trailer") {
        return <span className="text-xs text-gray-400">—</span>;
      }

      if (meta.tab === "pending") {
        return (
          <button
            type="button"
            onClick={() => meta.openDrawer(item)}
            className="btn hover:bg-primary-600/10 size-7 cursor-pointer rounded-full p-0"
            title="Generate Body Register"
          >
            <PencilSquareIcon className="text-primary-600 dark:text-primary-400 size-4.5" />
          </button>
        );
      }

      // Generate tab → view
      return (
        <button
          type="button"
          onClick={() => meta.openView(item)}
          className="btn hover:bg-primary-600/10 size-7 cursor-pointer rounded-full p-0"
          title="View Body Register"
        >
          <EyeIcon className="text-primary-600 dark:text-primary-400 size-4.5" />
        </button>
      );
    },
  },
];

export const exportColumns: { key: keyof WorkOrderRow; header: string }[] = [
  { key: "workOrderDate", header: "Work Order Date" },
  { key: "workOrderNo", header: "Work Order No" },
  { key: "partyName", header: "Party Name" },
  { key: "number", header: "Number" },
  { key: "city", header: "City" },
  { key: "model", header: "Model" },
  { key: "type", header: "Type" },
];
