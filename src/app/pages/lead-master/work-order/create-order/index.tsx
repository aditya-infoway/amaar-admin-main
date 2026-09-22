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
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { XMarkIcon } from "@heroicons/react/24/outline";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Combobox } from "@/components/shared/form/StyledCombobox";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";

import {
  Get,
  Post,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";

import { exportToExcel, exportToPdf } from "../shared/export";

import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

import { createColumns, createExportColumns } from "./columns";
import WorkOrderDrawer from "./WorkOrderDrawer";

import type { WorkOrder } from "../shared/types";

interface ContractorManager {
  employeeId: number;
  employeeName: string;
  department: string;
  branch: string;
  roleId: number;
}

export default function CreateOrderPage() {
  const [data, setData] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editing, setEditing] = useState<WorkOrder | null>(null);

  const [viewOnly, setViewOnly] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [assigningWorkOrder, setAssigningWorkOrder] =
    useState<WorkOrder | null>(null);

  const assignSaveRef = useRef(null);
  const [contractorManagers, setContractorManagers] = useState<
    ContractorManager[]
  >([]);

  const [selectedContractorManager, setSelectedContractorManager] =
    useState<ContractorManager | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const [filterWorkOrderNo, setFilterWorkOrderNo] = useState("");

  const [filterSalesOrderId, setFilterSalesOrderId] = useState("");

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);

      const financialYearId = localStorage.getItem("financialYearId");

      const response = await Get(
        "workorder/list",
        financialYearId ? { financialYearId } : {},
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        setData(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Work Order list error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchContractorManagers = async () => {
    try {
      const response = await Get(
        "master/employee/contractor-managers",
        {},
        false,
      );

      console.log("Contractor Managers API:", response.data);

      if (response.data?.success) {
        setContractorManagers(response.data.data || []);
      } else {
        setContractorManagers([]);
      }
    } catch (error) {
      console.error("Failed to fetch contractor managers:", error);
      setContractorManagers([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedContractorManager) {
      toasterrormsg("Please select Contractor Manager");
      return;
    }

    if (!assigningWorkOrder) {
      toasterrormsg("Work Order not selected");
      return;
    }

    try {
      const response = await Post(
        "workorder/assign",
        {
          workOrderId: assigningWorkOrder.id,
          contractorManagerId: selectedContractorManager.employeeId,
        },
        false,
      );

      console.log("Assign Work Order response:", response);

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          response?.data?.message || "Work Order assigned successfully.",
        );

        setAssignModalOpen(false);
        setSelectedContractorManager(null);

        // Refresh work order list
        await fetchWorkOrders();
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to assign Work Order.",
        );
      }
    } catch (error: any) {
      console.error("Assign Work Order error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while assigning Work Order.",
      );
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterWorkOrderNo &&
        !String(item.workOrderNo || "")
          .toLowerCase()
          .includes(filterWorkOrderNo.toLowerCase())
      ) {
        return false;
      }

      if (
        filterSalesOrderId &&
        !String(item.salesOrderNo || item.salesOrderId || "")
          .toLowerCase()
          .includes(filterSalesOrderId.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [data, filterWorkOrderNo, filterSalesOrderId]);

  const columns = useMemo(
    () =>
      createColumns((row: WorkOrder) => {
        console.log("ASSIGN CLICKED:", row);

        setAssigningWorkOrder(row);
        setSelectedContractorManager(null);
        fetchContractorManagers().then(() => setAssignModalOpen(true));
      }),
    [],
  );

  const exportColumns = useMemo(() => createExportColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,

    state: {
      globalFilter,
      sorting,
      rowSelection,
    },

    enableRowSelection: true,

    getRowId: (row) => String(row.id),

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

          if (response?.data?.success || response?.data?.status === 200) {
            setData((prev) =>
              prev.filter(
                (item) => String(item.id) !== String(row.original.id),
              ),
            );

            toastsuccessmsg("Work Order deleted successfully");
          } else {
            toasterrormsg(
              response?.data?.message || "Failed to delete Work Order",
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
              Delete(`workorder/${row.original.id}`, {}, false),
            ),
          );

          const ids = new Set(rows.map((row) => String(row.original.id)));

          setData((prev) => prev.filter((item) => !ids.has(String(item.id))));

          setRowSelection({});

          toastsuccessmsg("Selected Work Orders deleted successfully");
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
          );
        }
      },
    } as any,

    onGlobalFilterChange: setGlobalFilter,

    onSortingChange: setSorting,

    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
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
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(null);
            setViewOnly(false);
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "work_orders")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Work Order List",
              "work_orders",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Work Order ID"
                value={filterWorkOrderNo}
                onChange={(e) => setFilterWorkOrderNo(e.target.value)}
                placeholder="Filter by Work Order ID"
              />

              <Input
                label="Sales Order ID"
                value={filterSalesOrderId}
                onChange={(e) => setFilterSalesOrderId(e.target.value)}
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

      <Transition appear show={assignModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={() => setAssignModalOpen(false)}
          initialFocus={assignSaveRef}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300">
              {/* Header */}
              <div className="dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-base font-medium text-gray-800"
                >
                  Assign Work Order
                </DialogTitle>

                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="dark:hover:bg-dark-600 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-5 sm:px-5">
                {/* Work Order information */}
                <div className="dark:bg-dark-800 mb-4 rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Work Order</div>

                  <div className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                    {assigningWorkOrder?.workOrderNo || "-"}
                  </div>
                </div>

                {/* Employee dropdown - UI only for now */}
                <Combobox
                  data={contractorManagers}
                  displayField="employeeName"
                  value={selectedContractorManager}
                  onChange={setSelectedContractorManager}
                  placeholder="Search Contractor Manager"
                  label="Select Contractor Manager"
                  searchFields={["employeeName"]}
                />

                {/* Buttons */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="dark:border-dark-450 dark:text-dark-100 rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    ref={assignSaveRef}
                    disabled={!selectedContractorManager}
                    className="bg-primary-600 hover:bg-primary-700 rounded-lg px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleAssign}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </Page>
  );
}