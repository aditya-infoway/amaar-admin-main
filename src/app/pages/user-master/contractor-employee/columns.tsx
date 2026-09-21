import { createColumnHelper } from "@tanstack/react-table";
import { createElement } from "react";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import type { ExportColumn } from "../shared/export";
import type { ContractorEmployee } from "./types";

const columnHelper = createColumnHelper<ContractorEmployee>();

const RowActions = createRowActions<ContractorEmployee>("employee");

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

  columnHelper.accessor("partyName", {
    header: "Party",
    cell: ({ getValue }) =>
      createElement(
        "span",
        { className: "font-medium" },
        getValue() || "-",
      ),
  }),

  columnHelper.accessor("employeeName", {
    header: "Employee Name",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("employeeNo", {
    header: "Employee No.",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("address", {
    header: "Employee Address",
    cell: ({ getValue }) => {
      const value = getValue();

      return createElement(
        "span",
        {
          className: "block max-w-64 truncate",
          title: value ? String(value) : undefined,
        },
        value || "-",
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  }),
];

export const createExportColumns = (): ExportColumn<ContractorEmployee>[] => [
  { key: "partyName", header: "Party" },
  { key: "employeeName", header: "Employee Name" },
  { key: "employeeNo", header: "Employee No." },
  { key: "email", header: "Email" },
  { key: "address", header: "Employee Address" },
  { key: "aadharNumber", header: "Aadhar Number" },
  { key: "panNumber", header: "PAN Number" },
];