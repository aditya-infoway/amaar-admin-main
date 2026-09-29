import { createColumnHelper } from "@tanstack/react-table";
import type { SalesOrder } from "../shared/types";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import type { ExportColumn } from "../shared/export";

const columnHelper = createColumnHelper<SalesOrder>();

const RowActions = createRowActions<SalesOrder>("sales order", {
  withView: true,
});

export const createColumns = (
  modelOptions: { id: string; label: string }[] = [],
) => {
  const modelLabelById = new Map(
    modelOptions.map((item) => [item.id, item.label]),
  );

  return [
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

    columnHelper.accessor("soNo", {
      header: "SO No",
      cell: ({ getValue }) => (
        <span className="font-medium">
          {getValue() || "-"}
        </span>
      ),
    }),

    columnHelper.accessor("quotationId", {
      header: "Quotation",
      cell: ({ row }) =>
        (row.original as any).qNo ||
        row.original.quotationId ||
        "-",
    }),

    columnHelper.accessor("customerName", {
      header: "Customer Name",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("mobile", {
      header: "Mobile",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("city", {
      header: "City",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("model", {
      header: "Model",
      cell: ({ row }) => {
        const item = row.original as any;

        return (
          item.modelName ||
          modelLabelById.get(String(item.model)) ||
          item.model ||
          "-"
        );
      },
    }),

    columnHelper.accessor("qty", {
      header: "Qty",
      cell: ({ getValue }) => getValue() ?? 0,
    }),

    columnHelper.accessor("totalAmount", {
      header: "Total Amount",
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
};

/*
 * Columns used for Excel/PDF export
 */
export const createExportColumns = (): ExportColumn<SalesOrder>[] => [
  {
    key: "soNo",
    header: "SO No",
  },
  {
    key: "quotationId",
    header: "Quotation",
  },
  {
    key: "customerName",
    header: "Customer Name",
  },
  {
    key: "mobile",
    header: "Mobile",
  },
  {
    key: "city",
    header: "City",
  },
  {
    key: "model",
    header: "Model",
  },
  {
    key: "qty",
    header: "Qty",
  },
  {
    key: "unitPrice",
    header: "Unit Price",
  },
  {
    key: "totalAmount",
    header: "Total Amount",
  },
];