import { createColumnHelper } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../../shared/createRowActions";
import type { ExportColumn } from "../../shared/export";
import type { ItemCategory } from "./data";

const columnHelper = createColumnHelper<ItemCategory>();

const RowActions = createRowActions<ItemCategory>("item category");

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
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  }),

  columnHelper.accessor("stageName", {
    header: "Stage",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("categoryName", {
    header: "Item Category",
    cell: ({ getValue }) => getValue() || "-",
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: ({ getValue }) => {
      const value = getValue();
      return value
        ? new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  }),
];

export const createExportColumns = (): ExportColumn<ItemCategory>[] => [
  { key: "stageName", header: "Stage" },
  { key: "categoryName", header: "Item Category" },
    { key: "createdAt", header: "Created" },
  
];