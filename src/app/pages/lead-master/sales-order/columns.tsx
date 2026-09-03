import { createColumnHelper } from "@tanstack/react-table";
import type { SalesOrder } from "../shared/types";

const columnHelper = createColumnHelper<SalesOrder>();

export const createColumns = () => [
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
    cell: ({ getValue }) => getValue() || "-",
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
    cell: ({ getValue }) => getValue() || "-",
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

  columnHelper.accessor("mode", {
    header: "Mode",
    cell: ({ getValue }) => {
      const mode = getValue();

      return mode === "manual" ? "Manual" : "As Its";
    },
  }),

  columnHelper.display({
    id: "kyc",
    header: "KYC",
    cell: ({ row }) => {
      const item = row.original as any;

      const hasAadhar =
        !!item.aadharNumber || !!item.aadharImage;

      const hasPan =
        !!item.panNumber || !!item.panImage;

      const hasGst =
        !!item.gstNumber || !!item.gstImage;

      if (!hasAadhar && !hasPan && !hasGst) {
        return (
          <span className="text-gray-400">
            -
          </span>
        );
      }

      return (
        <div className="flex flex-wrap gap-1">
          {hasAadhar && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              Aadhar
            </span>
          )}

          {hasPan && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              PAN
            </span>
          )}

          {hasGst && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              GST
            </span>
          )}
        </div>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-primary text-sm font-medium hover:underline"
            onClick={() =>
              meta?.openEditDrawer?.(row.original)
            }
          >
            Edit
          </button>

          <button
            type="button"
            className="text-error text-sm font-medium hover:underline"
            onClick={() =>
              meta?.deleteRow?.(row)
            }
          >
            Delete
          </button>
        </div>
      );
    },
  }),
];

/*
 * Columns used for Excel/PDF export
 */
export const createExportColumns = () => [
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
  {
    key: "mode",
    header: "Mode",
  },
  {
    key: "aadharNumber",
    header: "Aadhar Number",
  },
  {
    key: "panNumber",
    header: "PAN Number",
  },
  {
    key: "gstNumber",
    header: "GST Number",
  },
];