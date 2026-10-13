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
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Delete,
  Get,
  Put,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";

import { exportToExcel, exportToPdf } from "../../shared/export";
import { MasterTable } from "../../shared/MasterTable";
import { MasterToolbar } from "../../shared/MasterToolbar";

import { ItemCategoryDrawer } from "./ItemCategoryDrawer";
import { createColumns, createExportColumns } from "./columns";
import {
  emptyItemCategory,
  formatDateTime,
  type ItemCategory,
} from "./data";

type Mode = "add" | "edit" | "view";

const normalizeStatus = (v: any) =>
  v === true || v === 1 || v === "1" || v === "active" || v === "Active";

export default function ItemCategoryPage() {
  const [data, setData] = useState<ItemCategory[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<Mode>("add");
  const [editing, setEditing] = useState<ItemCategory | null>(null);

  const fetchList = async () => {
    try {
   
      const financialYearId = localStorage.getItem("financialYearId");

           const response = await Get(
        "main-process/list",
        financialYearId ? { financialYearId } : {},
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        const list = (response?.data?.data || []).map((r: any) => {
          const status = normalizeStatus(r.status);
          return {
            ...r,
            id: String(r.id),
            mainProcess: r.mainProcess ?? "",
            processes: r.processes ?? [],
            createdBy: r.createdByName ?? r.createdBy ?? "",
            status,
            statusLabel: status ? "Active" : "Inactive",
            createdAtLabel: formatDateTime(r.createdAt),
          } as ItemCategory;
        });
        setData(list);
      } else {
        console.error("Main process list failed:", response?.data);
      }
    } catch (error) {
      console.error("Main process list error:", error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = useMemo(() => createColumns(), []);
  const exportColumns = useMemo(() => createExportColumns(), []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),

    meta: {
      openViewDrawer: (row: ItemCategory) => {
        setEditing(row);
        setDrawerMode("view");
        setDrawerOpen(true);
      },

      openEditDrawer: (row: ItemCategory) => {
        setEditing(row);
        setDrawerMode("edit");
        setDrawerOpen(true);
      },

      // Status toggle (optimistic update, fail hone pe revert)
          toggleStatus: async (row: any) => {
        const id = String(row.original.id);
        const newStatus = !row.original.status;

        // dusra process already Active hai to ON mat karne do
        if (newStatus) {
          const activeOther = data.find(
            (i) => i.status && String(i.id) !== id,
          );
          if (activeOther) {
            toasterrormsg(
              `"${activeOther.mainProcess}" is already Active. Please make it Inactive first.`,
            );
            return;
          }
        }

        setData((prev) =>
          prev.map((i) =>
            String(i.id) === id
              ? { ...i, status: newStatus, statusLabel: newStatus ? "Active" : "Inactive" }
              : i,
          ),
        );

        try {
          const response = await Put(
            `main-process/status/${id}`,
            { status: newStatus },
            false,
          );
          if (response?.data?.success || response?.data?.status === 200) {
            toastsuccessmsg(response?.data?.message || "Status updated");
          } else {
            throw new Error(response?.data?.message || "Failed to update status");
          }
        } catch (error: any) {
          setData((prev) =>
            prev.map((i) =>
              String(i.id) === id
                ? { ...i, status: !newStatus, statusLabel: !newStatus ? "Active" : "Inactive" }
                : i,
            ),
          );
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update status.",
          );
        }
      },

      deleteRow: async (row: any) => {
        try {
                 const response = await Delete(
            `main-process/${row.original.id}`,
            {},
            false,
          );

          if (response?.data?.success || response?.data?.status === 200) {
            setData((prev) =>
              prev.filter((i) => String(i.id) !== String(row.original.id)),
            );
            toastsuccessmsg(response?.data?.message || "Deleted successfully");
          } else {
            toasterrormsg(response?.data?.message || "Failed to delete.");
          }
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting.",
          );
        }
      },

      deleteRows: async (rows: any[]) => {
        try {
          const ids = rows.map((row) => row.original.id);
          await Promise.all(
            ids.map((id) => Delete(`main-process/${id}`, {}, false)),
          );
          const idSet = new Set(ids.map(String));
          setData((prev) => prev.filter((i) => !idSet.has(String(i.id))));
          setRowSelection({});
          toastsuccessmsg("Selected items deleted successfully");
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting.",
          );
        }
      },
    },

    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Main Process">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Production Settings"
          createLabel="Add  Process"
          searchPlaceholder="Search main process..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => {
            setEditing(emptyItemCategory());
            setDrawerMode("add");
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "main_process")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Main Process List", "main_process")
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No main process found. Click Add Main Process to add one."
        />
          <div className="bg-primary-600/10 border-primary-600/30 mt-120 flex items-start gap-2 rounded-lg border px-3 py-2.5">
          <InformationCircleIcon className="text-primary-600 mt-0.5 size-5 shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Note:</span> This process is for
            production.
          </p>
        </div>
      </div>

      <ItemCategoryDrawer
        isOpen={drawerOpen}
        mode={drawerMode}
        close={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        itemCategory={editing}
        onSave={fetchList}
      />
    </Page>
  );
}