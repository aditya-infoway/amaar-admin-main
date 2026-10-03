// Debit Note - Page 1: vendor summary list
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { exportToExcel, exportToPdf } from "../shared/export";
import { TextCell } from "../shared/tableCells";
import { DocType } from "./data";

type VendorRow = {
  vendorId: string;
  vendorName: string;
  number: number;
  pending: { grr: number; qc: number };
  complete: { grr: number; qc: number };
};

// number + icon. With onClick the icon opens the next page (disabled at 0),
// without onClick it is a plain icon (used for Complete until view feature is built)
function Count({ value, onClick }: { value: number; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className={
          value > 0
            ? "dark:text-dark-100 font-semibold text-gray-800"
            : "dark:text-dark-300 text-gray-400"
        }
      >
        {value}
      </span>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={value === 0}
          title="Open"
          className="text-primary-600 dark:text-primary-400 dark:hover:bg-dark-500 cursor-pointer rounded p-1 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowDownTrayIcon className="size-6" />
        </button>
      ) : (
        <span
          className={`text-primary-600 dark:text-primary-400 p-1 ${
            value > 0 ? "" : "opacity-30"
          }`}
        >
          <ArrowDownTrayIcon className="size-6" />
        </span>
      )}
    </div>
  );
}

export default function DebitNoteListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get("debit-note/vendors", { financialYearId }, false);
        if (res.data?.success) setData(res.data.data || []);
        else toasterrormsg(res.data?.message || "Failed to load vendors.");
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load vendors.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const open = (
    vendorId: string,
    type: DocType,
    status: "pending" | "complete",
  ) =>
    navigate(
      `/accounting-master/debit-note/vendor-note/${vendorId}/${type}?status=${status}`,
    );

  const columns: ColumnDef<VendorRow>[] = [
    { accessorKey: "vendorName", header: "Vendor Name", cell: TextCell },
    { accessorKey: "number", header: "Number", cell: TextCell },
    {
      id: "pending",
      header: "Pending",
      columns: [
        {
          id: "pendingGrr",
          header: "GRR",
          accessorFn: (v) => v.pending.grr,
          cell: ({ row }) => (
            <Count
              value={row.original.pending.grr}
              onClick={() => open(row.original.vendorId, "grr", "pending")}
            />
          ),
        },
        {
          id: "pendingQc",
          header: "QC",
          accessorFn: (v) => v.pending.qc,
          cell: ({ row }) => (
            <Count
              value={row.original.pending.qc}
              onClick={() => open(row.original.vendorId, "qc", "pending")}
            />
          ),
        },
      ],
    },
    {
      id: "complete",
      header: "Complete",
      columns: [
        {
          id: "completeGrr",
          header: "GRR",
          accessorFn: (v) => v.complete.grr,
          cell: ({ row }) => <Count value={row.original.complete.grr} />,
        },
        {
          id: "completeQc",
          header: "QC",
          accessorFn: (v) => v.complete.qc,
          cell: ({ row }) => <Count value={row.original.complete.qc} />,
        },
      ],
    },
  ];

  const exportColumns = [
    { key: "vendorName" as const, header: "Vendor Name" },
    { key: "number" as const, header: "Number" },
    { key: "pendingGrr" as const, header: "Pending GRR" },
    { key: "pendingQc" as const, header: "Pending QC" },
    { key: "completeGrr" as const, header: "Complete GRR" },
    { key: "completeQc" as const, header: "Complete QC" },
  ];

  const exportData = () =>
    data.map((v) => ({
      vendorName: v.vendorName,
      number: v.number,
      pendingGrr: v.pending.grr,
      pendingQc: v.pending.qc,
      completeGrr: v.complete.grr,
      completeQc: v.complete.qc,
    }));

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Debit Note">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Debit Note"
          searchPlaceholder="Search vendor..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() =>
            exportToExcel(exportData(), exportColumns, "debit-note-vendors")
          }
          onExportPdf={() =>
            exportToPdf(
              exportData(),
              exportColumns,
              "Debit Note",
              "debit-note-vendors",
            )
          }
        />
        <MasterTable
          table={table}
          columnCount={6}
          emptyMessage={loading ? "Loading vendors..." : "No vendors found."}
        />
      </div>
    </Page>
  );
}