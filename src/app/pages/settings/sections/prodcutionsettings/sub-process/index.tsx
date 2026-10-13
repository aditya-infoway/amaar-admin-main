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
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Delete, Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import { exportToExcel, exportToPdf } from "../../../shared/export";
import { MasterTable } from "../../../shared/MasterTable";
import { MasterToolbar } from "../../../shared/MasterToolbar";

import { SubProcessDrawer } from "./SubProcessDrawer";
import { createColumns, createExportColumns } from "./columns";
import { emptySubProcess, formatDateTime, type SubProcess } from "./data";

type Mode = "add" | "edit" | "view";

const normalizeStatus = (v: any) =>
  v === true || v === 1 || v === "1" || v === "active" || v === "Active";

export default function SubProcessPage() {
  const [data, setData] = useState<SubProcess[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<Mode>("add");
  const [editing, setEditing] = useState<SubProcess | null>(null);

  const fetchList = async () => {
    try {
      const financialYearId = localStorage.getItem("financialYearId");

      const response = await Get(
        "sub-process/list",
        financialYearId ? { financialYearId } : {},
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        const list = (response?.data?.data || []).map((r: any) => {
          const status = normalizeStatus(r.status);
          return {
            ...r,
            id: String(r.id),
            processId: String(r.processId),
            processLabel: r.processName
              ? `${r.processName} `
              : "-",
            createdBy: r.createdByName ?? "",
            status,
            statusLabel: status ? "Active" : "Inactive",
            createdAtLabel: formatDateTime(r.createdAt),
          } as SubProcess;
        });
        setData(list);
      } else {
        console.error("Sub process list failed:", response?.data);
      }
    } catch (error) {
      console.error("Sub process list error:", error);
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
      openViewDrawer: (row: SubProcess) => {
        setEditing(row);
        setDrawerMode("view");
        setDrawerOpen(true);
      },

      openEditDrawer: (row: SubProcess) => {
        setEditing(row);
        setDrawerMode("edit");
        setDrawerOpen(true);
      },

      toggleStatus: async (row: any) => {
        const id = String(row.original.id);
        const newStatus = !row.original.status;
        const label = (s: boolean) => (s ? "Active" : "Inactive");

        setData((prev) =>
          prev.map((i) =>
            String(i.id) === id
              ? { ...i, status: newStatus, statusLabel: label(newStatus) }
              : i,
          ),
        );

        try {
          const response = await Put(
            `sub-process/status/${id}`,
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
                ? { ...i, status: !newStatus, statusLabel: label(!newStatus) }
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
            `sub-process/${row.original.id}`,
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
            ids.map((id) => Delete(`sub-process/${id}`, {}, false)),
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
    <Page title="Sub Process">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Sub Process"
          createLabel="Add Sub Process"
          searchPlaceholder="Search sub process..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => {
            setEditing(emptySubProcess());
            setDrawerMode("add");
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "sub_process")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Sub Process List", "sub_process")
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No sub process found. Click Add Sub Process to add one."
        />
      </div>

      <SubProcessDrawer
        isOpen={drawerOpen}
        mode={drawerMode}
        close={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        subProcess={editing}
        onSave={fetchList}
      />
    </Page>
  );
}