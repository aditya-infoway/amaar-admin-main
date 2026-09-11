import { createColumnHelper } from "@tanstack/react-table";

import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import type { WorkOrder } from "../shared/types";

const columnHelper = createColumnHelper<WorkOrder>();

const RowActions = createRowActions<WorkOrder>("work order", {
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

      return (
        pagination.pageIndex * pagination.pageSize +
        row.index +
        1
      );
    },
  }),

  columnHelper.accessor("workOrderNo", {
    header: "Work Order ID",
    cell: ({ getValue }) => (
      <span className="font-medium">
        {getValue() || "-"}
      </span>
    ),
  }),

  columnHelper.accessor("salesOrderId", {
    header: "Sales Order ID",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("customerName", {
    header: "Name",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("mobile", {
    header: "Number",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("city", {
    header: "City",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("model", {
    header: "Model",
    cell: ({ getValue }) => getValue() || "-",
  }),

  columnHelper.accessor("totalPrice", {
    header: "Total Price",
    cell: ({ getValue }) => {
      const amount = Number(getValue()) || 0;

      return `₹ ${amount.toLocaleString("en-IN")}`;
    },
  }),

  columnHelper.accessor("gst", {
    header: "GST",
    cell: ({ getValue }) => {
      const amount = Number(getValue()) || 0;

      return `₹ ${amount.toLocaleString("en-IN")}`;
    },
  }),

  columnHelper.accessor("grandTotal", {
    header: "Total",
    cell: ({ getValue }) => {
      const amount = Number(getValue()) || 0;

      return `₹ ${amount.toLocaleString("en-IN")}`;
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  }),
];