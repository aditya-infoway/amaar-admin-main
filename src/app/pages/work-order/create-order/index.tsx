import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";

import { Get, Delete, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

import { createColumns } from "./columns";
import WorkOrderDrawer from "./WorkOrderDrawer";

import type { WorkOrder } from "../shared/types";

export default function CreateOrderPage() {
  const [data, setData] = useState<WorkOrder[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<WorkOrder | null>(null);

  const [viewOnly, setViewOnly] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [filterWorkOrderNo, setFilterWorkOrderNo] =
    useState("");

  const [filterSalesOrderId, setFilterSalesOrderId] =
    useState("");

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);

      const financialYearId =
        localStorage.getItem(
          "financialYearId",
        );

      const response = await Get(
        "workorder/list",
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
      }
    } catch (error) {
      console.error(
        "Work Order list error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterWorkOrderNo &&
        !String(item.workOrderNo || "")
          .toLowerCase()
          .includes(
            filterWorkOrderNo.toLowerCase(),
          )
      ) {
        return false;
      }

      if (
        filterSalesOrderId &&
        !String(item.salesOrderId || "")
          .toLowerCase()
          .includes(
            filterSalesOrderId.toLowerCase(),
          )
      ) {
        return false;
      }

      return true;
    });
  }, [
    data,
    filterWorkOrderNo,
    filterSalesOrderId,
  ]);

  const columns = useMemo(
    () => createColumns(),
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,

    state: {
      globalFilter,
      sorting,
      rowSelection,
    },

    enableRowSelection: true,

    getRowId: (row) =>
      String(row.id),

    meta: {
      viewRow: (row: WorkOrder) => {
        setEditing(row);
        setViewOnly(true);
        setDrawerOpen(true);
      },

      openEditDrawer: (row: WorkOrder) => {
        setEditing(row);
        setViewOnly(false);
        setDrawerOpen(true);
      },

      deleteRow: async (row: any) => {
        try {
          const response = await Delete(
            `workorder/${row.original.id}`,
            {},
            false,
          );

          if (
            response?.data?.success ||
            response?.data?.status === 200
          ) {
            setData((prev) =>
              prev.filter(
                (item) =>
                  String(item.id) !==
                  String(row.original.id),
              ),
            );

            toastsuccessmsg(
              "Work Order deleted successfully",
            );
          } else {
            toasterrormsg(
              response?.data?.message ||
                "Failed to delete Work Order",
            );
          }
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
          );
        }
      },

      deleteRows: async (rows: any[]) => {
        try {
          await Promise.all(
            rows.map((row) =>
              Delete(
                `workorder/${row.original.id}`,
                {},
                false,
              ),
            ),
          );

          const ids = new Set(
            rows.map((row) =>
              String(row.original.id),
            ),
          );

          setData((prev) =>
            prev.filter(
              (item) =>
                !ids.has(String(item.id)),
            ),
          );

          setRowSelection({});

          toastsuccessmsg(
            "Selected Work Orders deleted successfully",
          );
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
          );
        }
      },
    },

    onGlobalFilterChange:
      setGlobalFilter,

    onSortingChange: setSorting,

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
    <Page title="Create Work Order">
      <div className="transition-content w-full pb-5">

        <MasterToolbar
          title="Create Work Order"
          createLabel="Create Work Order"
          searchPlaceholder="Search work orders..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() =>
            setShowFilters(
              (value) => !value,
            )
          }
          onCreate={() => {
            setEditing(null);
            setViewOnly(false);
            setDrawerOpen(true);
          }}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">

              <Input
                label="Work Order ID"
                value={filterWorkOrderNo}
                onChange={(e) =>
                  setFilterWorkOrderNo(
                    e.target.value,
                  )
                }
                placeholder="Filter by Work Order ID"
              />

              <Input
                label="Sales Order ID"
                value={filterSalesOrderId}
                onChange={(e) =>
                  setFilterSalesOrderId(
                    e.target.value,
                  )
                }
                placeholder="Filter by Sales Order ID"
              />

            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No Work Orders found. Click Create Work Order to add one."
        />

      </div>

      <WorkOrderDrawer
        isOpen={drawerOpen}
        readOnly={viewOnly}
        close={() => {
          setDrawerOpen(false);
          setEditing(null);
          setViewOnly(false);
        }}
        workOrder={editing}
        onSave={async () => {
          await fetchWorkOrders();

          setDrawerOpen(false);
          setEditing(null);
          setViewOnly(false);
        }}
      />
    </Page>
  );
}