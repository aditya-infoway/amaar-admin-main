import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";

import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";

import {
  Delete,
  Get,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";

import {
  exportToExcel,
  exportToPdf,
} from "../shared/export";

import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

import { SalesOrderDrawer } from "./SalesOrderDrawer";

import {
  createColumns,
  createExportColumns,
} from "./columns";

import { emptySalesOrder } from "./data";

import type { SalesOrder } from "../shared/types";

export default function SalesOrderPage() {
  const [data, setData] = useState<SalesOrder[]>([]);

  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<SalesOrder | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [filterCustomer, setFilterCustomer] =
    useState("");

  const [filterCity, setFilterCity] =
    useState("");

  const [filterSoNo, setFilterSoNo] =
    useState("");

  /*
   * Fetch Sales Orders
   */
  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        setLoading(true);

        const financialYearId =
          sessionStorage.getItem(
            "financialYearId",
          );

        const response = await Get(
          "salesorder/list",
          financialYearId
            ? { financialYearId }
            : {},
          false,
        );

        if (
          response?.data?.success ||
          response?.data?.status === 200
        ) {
          setData(
            response?.data?.data || [],
          );
        } else {
          console.error(
            "Sales Order list failed:",
            response?.data?.message ||
              response?.data,
          );
        }
      } catch (error) {
        console.error(
          "Sales Order list error:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  /*
   * Filters
   */
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      if (
        filterCustomer &&
        !(item.customerName || "")
          .toLowerCase()
          .includes(
            filterCustomer.toLowerCase(),
          )
      ) {
        return false;
      }

      if (
        filterCity &&
        !(item.city || "")
          .toLowerCase()
          .includes(
            filterCity.toLowerCase(),
          )
      ) {
        return false;
      }

      if (
        filterSoNo &&
        !(item.soNo || "")
          .toLowerCase()
          .includes(
            filterSoNo.toLowerCase(),
          )
      ) {
        return false;
      }

      return true;
    });
  }, [
    data,
    filterCustomer,
    filterCity,
    filterSoNo,
  ]);

  /*
   * Columns
   */
  const salesOrderColumns = useMemo(
    () => createColumns(),
    [],
  );

  const salesOrderExportColumns =
    useMemo(
      () => createExportColumns(),
      [],
    );

  /*
   * Update table data
   */
  const persist = (
    next: SalesOrder[],
  ) => {
    setData(next);
  };

  /*
   * React Table
   */
  const table = useReactTable({
    data: filteredData,

    columns: salesOrderColumns,

    state: {
      globalFilter,
      sorting,
      rowSelection,
    },

    enableRowSelection: true,

    getRowId: (row) =>
      String(row.id),

    meta: {
      /*
       * Edit Sales Order
       */
      openEditDrawer: (
        row: SalesOrder,
      ) => {
        setEditing(row);
        setDrawerOpen(true);
      },

      /*
       * Delete Single
       */
      deleteRow: async (
        row: any,
      ) => {
        try {
          const response =
            await Delete(
              `salesorder/${row.original.id}`,
              {},
              false,
            );

          if (
            response?.data?.success ||
            response?.data?.status === 200
          ) {
            persist(
              data.filter(
                (item) =>
                  String(item.id) !==
                  String(
                    row.original.id,
                  ),
              ),
            );

            toastsuccessmsg(
              response?.data?.message ||
                "Sales Order deleted successfully",
            );
          } else {
            toasterrormsg(
              response?.data?.message ||
                "Failed to delete sales order.",
            );
          }
        } catch (error: any) {
          console.error(
            "Sales Order delete error:",
            error,
          );

          toasterrormsg(
            error?.response?.data
              ?.message ||
              error?.message ||
              "Something went wrong while deleting sales order.",
          );
        }
      },

      /*
       * Delete Multiple
       */
      deleteRows: async (
        rows: any[],
      ) => {
        try {
          const ids =
            rows.map(
              (row) =>
                row.original.id,
            );

          await Promise.all(
            ids.map((id) =>
              Delete(
                `salesorder/${id}`,
                {},
                false,
              ),
            ),
          );

          const idSet = new Set(
            ids.map((id) =>
              String(id),
            ),
          );

          persist(
            data.filter(
              (item) =>
                !idSet.has(
                  String(item.id),
                ),
            ),
          );

          setRowSelection({});

          toastsuccessmsg(
            "Selected sales orders deleted successfully",
          );
        } catch (error: any) {
          console.error(
            "Sales Order bulk delete error:",
            error,
          );

          toasterrormsg(
            error?.response?.data
              ?.message ||
              error?.message ||
              "Something went wrong while deleting sales orders.",
          );
        }
      },
    },

    filterFns: {
      fuzzy: fuzzyFilter,
    },

    globalFilterFn:
      fuzzyFilter,

    onGlobalFilterChange:
      setGlobalFilter,

    onSortingChange:
      setSorting,

    onRowSelectionChange:
      setRowSelection,

    getCoreRowModel:
      getCoreRowModel(),

    getFilteredRowModel:
      getFilteredRowModel(),

    getSortedRowModel:
      getSortedRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),
  });

  return (
    <Page title="Sales Order">
      <div className="transition-content w-full pb-5">

        <MasterToolbar
          title="Sales Order"

          createLabel="Add Sales Order"

          searchPlaceholder="Search sales orders..."

          table={table}

          showFilters={showFilters}

          onToggleFilters={() =>
            setShowFilters(
              (value) => !value,
            )
          }

          onCreate={() => {
            setEditing(
              emptySalesOrder(),
            );

            setDrawerOpen(true);
          }}

          onExportExcel={() =>
            exportToExcel(
              filteredData,
              salesOrderExportColumns,
              "sales_orders",
            )
          }

          onExportPdf={() =>
            exportToPdf(
              filteredData,
              salesOrderExportColumns,
              "Sales Order List",
              "sales_orders",
            )
          }

          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">

              <Input
                label="Sales Order No"
                value={filterSoNo}
                onChange={(e) =>
                  setFilterSoNo(
                    e.target.value,
                  )
                }
                placeholder="Filter by SO number"
              />

              <Input
                label="Customer Name"
                value={filterCustomer}
                onChange={(e) =>
                  setFilterCustomer(
                    e.target.value,
                  )
                }
                placeholder="Filter by customer name"
              />

              <Input
                label="City"
                value={filterCity}
                onChange={(e) =>
                  setFilterCity(
                    e.target.value,
                  )
                }
                placeholder="Filter by city"
              />

            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={
            salesOrderColumns.length
          }
          emptyMessage="No sales orders found. Click Add Sales Order to add one."
        />

      </div>

      <SalesOrderDrawer
        isOpen={drawerOpen}

        close={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}

        salesOrder={editing}

        onSave={(item) => {
          const exists =
            data.some(
              (row) =>
                String(row.id) ===
                String(item.id),
            );

          persist(
            exists
              ? data.map((row) =>
                  String(row.id) ===
                  String(item.id)
                    ? item
                    : row,
                )
              : [item, ...data],
          );
        }}
      />
    </Page>
  );
}