import { createColumnHelper } from "@tanstack/react-table";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import type { ExportColumn } from "../../../shared/export";
import { formatDateTime, type SubProcess } from "./data";

const columnHelper = createColumnHelper<SubProcess>();

const itemClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-dark-100 data-focus:bg-gray-100 dark:data-focus:bg-dark-600";

function RowActions({ row, table }: { row: any; table: any }) {
  const meta = table.options.meta as any;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className="dark:hover:bg-dark-500 flex size-8 items-center justify-center rounded-full hover:bg-gray-200"
        title="Actions"
      >
        <EllipsisHorizontalIcon className="size-5" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="dark:bg-dark-700 dark:border-dark-500 z-100 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg focus:outline-none"
      >
        <MenuItem>
          <button
            type="button"
            className={itemClass}
            onClick={() => meta?.openViewDrawer?.(row.original)}
          >
            <EyeIcon className="size-4.5" />
            View
          </button>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            className={itemClass}
            onClick={() => meta?.openEditDrawer?.(row.original)}
          >
            <PencilIcon className="size-4.5" />
            Edit
          </button>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this item?")) {
                meta?.deleteRow?.(row);
              }
            }}
          >
            <TrashIcon className="size-4.5" />
            Delete
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

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

  columnHelper.accessor("processLabel", {
    header: "Process",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("subProcessCode", {
    header: "Sub Process Code",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("subProcessName", {
    header: "Sub Process Name",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("serialNo", {
    header: "Serial No",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("createdAt", {
    header: "Created Date & Time",
    cell: ({ getValue }) => formatDateTime(getValue()),
  }),

  columnHelper.accessor("createdBy", {
    header: "Created By",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const checked = Boolean(row.original.status);
      return (
        <Switch
          checked={checked}
          onChange={() => meta?.toggleStatus?.(row)}
          className={`${
            checked ? "bg-primary-600" : "bg-gray-300 dark:bg-dark-500"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${
              checked ? "translate-x-6" : "translate-x-1"
            } inline-block size-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row, table }) => <RowActions row={row} table={table} />,
  }),
];

export const createExportColumns = (): ExportColumn<SubProcess>[] => [
  { key: "processLabel", header: "Process" },
  { key: "subProcessCode", header: "Sub Process Code" },
  { key: "subProcessName", header: "Sub Process Name" },
  { key: "serialNo", header: "Serial No" },
  { key: "createdAtLabel", header: "Created Date & Time" },
  { key: "createdBy", header: "Created By" },
  { key: "statusLabel", header: "Status" },
];