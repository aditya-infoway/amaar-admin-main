import { createColumnHelper } from "@tanstack/react-table";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import type { ExportColumn } from "../shared/export";

type Indent = {
  id: string;
  indentNo?: string;
  workOrderId?: string;
  workOrderNo?: string;
  modelName?: string;
  date?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const columnHelper = createColumnHelper<Indent>();

const RowActions = createRowActions<Indent>("indent", {
  withView: true,
});

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
    cell: RowActions,
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