import { createColumnHelper } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { CellContext } from "@tanstack/react-table";
import type { ExportColumn } from "../shared/export";
import type { Indent } from "./types";

const formatDate = (value?: string) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}-${month}-${year}`;
};

const columnHelper = createColumnHelper<Indent>();

const ViewAction = ({ row, table }: CellContext<Indent, unknown>) => (
  <button
    type="button"
    title="View"
    onClick={() => (table.options.meta as any)?.viewRow?.(row.original)}
    className="dark:hover:bg-dark-500 flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-200"
  >
    <EyeIcon className="size-4.5" />
  </button>
);

export const createColumns = () => [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  }),

  columnHelper.display({
    id: "srNo",
    header: "Sr. No.",
    cell: ({ row, table }) => {
      const pagination = table.getState().pagination;
      return pagination.pageIndex * pagination.pageSize + row.index + 1;
    },
  }),

  columnHelper.accessor("indentNo", {
    header: "Indent No",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() || "-"}</span>
    ),
  }),

  columnHelper.accessor("workOrderId", {
    header: "Work Order ID",
    cell: ({ row }) =>
      row.original.workOrderNo || row.original.workOrderId || "-",
  }),

  columnHelper.accessor("modelName", {
    header: "Model Name",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue()),
  }),

  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ViewAction,
    enableSorting: false,
  }),
];

/*
 * Columns used for Excel/PDF export
 */
export const createExportColumns = (): ExportColumn<Indent>[] => [
  { key: "indentNo", header: "Indent No" },
  { key: "workOrderId", header: "Work Order ID" },
  { key: "modelName", header: "Model Name" },
  { key: "date", header: "Date" },
];
