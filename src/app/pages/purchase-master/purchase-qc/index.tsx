import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { exportToExcel, exportToPdf } from "../shared/export";
import { TextCell } from "../shared/tableCells";

function formatDateForDisplay(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

type QcRow = {
  id: string;
  qcNo: string;
  qcDate: string;
  grrNo: string;
  supplierName: string;
  supplierNumber: string;
  status: string;
  createdBy: string;
  createdType: string;
};

export default function QcList() {
  const navigate = useNavigate();
  const [data, setData] = useState<QcRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get("purchase-qc/list", { financialYearId }, false);
        if (res.data?.success) {
          setData(res.data.data || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load QC list.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load QC list.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const qcColumns = [
    { accessorKey: "qcNo", header: "QC No", cell: TextCell },
    {
      accessorKey: "qcDate",
      header: "QC Date",
      cell: ({ getValue }: { getValue: () => string }) =>
        formatDateForDisplay(getValue()),
    },
    { accessorKey: "grrNo", header: "GRR No", cell: TextCell },
    { accessorKey: "supplierName", header: "Supplier Name", cell: TextCell },
    { accessorKey: "supplierNumber", header: "Number", cell: TextCell },
    { accessorKey: "createdBy", header: "Created By", cell: TextCell },
    { accessorKey: "createdType", header: "Created Type", cell: TextCell },
    {
      id: "action",
      header: "Action",
      cell: ({ row }: { row: { original: QcRow } }) => (
        <Button
          isIcon
          variant="flat"
          onClick={() =>
            navigate(`/purchase-master/purchase-qc/view/${row.original.id}`)
          }
        >
          <EyeIcon className="size-4.5" />
        </Button>
      ),
    },
  ];

  const qcExportColumns = [
    { key: "qcNo" as const, header: "QC No" },
    { key: "qcDate" as const, header: "QC Date" },
    { key: "grrNo" as const, header: "GRR No" },
    { key: "supplierName" as const, header: "Supplier Name" },
    { key: "supplierNumber" as const, header: "Number" },
    { key: "createdBy" as const, header: "Created By" },
    { key: "createdType" as const, header: "Created Type" },
  ];

  const table = useReactTable({
    data,
    columns: qcColumns,
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

  const exportData = () =>
    data.map((q) => ({ ...q, qcDate: formatDateForDisplay(q.qcDate) }));

  return (
    <Page title="Purchase QC">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Purchase QC"
          createLabel="Create QC"
          searchPlaceholder="Search QC..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => navigate("/purchase-master/purchase-qc/create")}
          onExportExcel={() =>
            exportToExcel(exportData(), qcExportColumns, "qc-list")
          }
          onExportPdf={() =>
            exportToPdf(exportData(), qcExportColumns, "QC List", "qc-list")
          }
        />
        <MasterTable
          table={table}
          columnCount={qcColumns.length}
          emptyMessage={loading ? "Loading QC list..." : "No QC records found."}
        />
      </div>
    </Page>
  );
}
