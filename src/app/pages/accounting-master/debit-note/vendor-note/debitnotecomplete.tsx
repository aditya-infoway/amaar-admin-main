import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
type Row = {
  id: string;
  debitNoteNo: string;
  debitNoteDate: string;
  docNo: string;
  supplierName: string;
  number: string;
  purchaseDate: string;
  purNo: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  narration: string;
};

function fmtDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

const amountCell = ({ getValue }: { getValue: () => unknown }) => (
  <span className="block text-right">{Number(getValue() || 0).toFixed(2)}</span>
);

export default function DebitNoteCompletePage() {
  const { vendorId = "", type = "grr" } = useParams<{
    vendorId: string;
    type: string;
  }>();
  const docLabel = type === "qc" ? "QC" : "GRR";

  const navigate = useNavigate();

  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          `debit-note/vendor-complete/${vendorId}/${type}`,
          { financialYearId },
          false,
        );
        if (res.data?.success) setData(res.data.data || []);
        else toasterrormsg(res.data?.message || "Failed to load list.");
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to load list.");
      } finally {
        setLoading(false);
      }
    })();
  }, [vendorId, type]);

  const columns: ColumnDef<Row>[] = [
    {
      id: "srNo",
      header: "Sr No",
      enableSorting: false,
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const pos = table.getRowModel().rows.findIndex((r) => r.id === row.id);
        return pageIndex * pageSize + pos + 1;
      },
    },
    { accessorKey: "debitNoteNo", header: "Debit Note", cell: TextCell },
    {
      accessorKey: "debitNoteDate",
      header: "Date",
      cell: ({ getValue }) => fmtDate(getValue() as string),
    },
    { accessorKey: "docNo", header: `${docLabel} No`, cell: TextCell },
    { accessorKey: "supplierName", header: "Supplier Name", cell: TextCell },
    { accessorKey: "number", header: "Number", cell: TextCell },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ getValue }) => fmtDate(getValue() as string),
    },
    { accessorKey: "purNo", header: "Pur No", cell: TextCell },
    {
      accessorKey: "taxableAmount",
      header: "Taxable Amount",
      cell: amountCell,
    },
    { accessorKey: "gstAmount", header: "GST Amount", cell: amountCell },
    { accessorKey: "totalAmount", header: "Total Amount", cell: amountCell },
    {
      accessorKey: "narration",
      header: "Narration",
      cell: ({ getValue }) => (getValue() as string) || "-",
    },
  ];

  const exportColumns = [
    { key: "debitNoteNo" as const, header: "Debit Note" },
    { key: "debitNoteDate" as const, header: "Date" },
    { key: "docNo" as const, header: `${docLabel} No` },
    { key: "supplierName" as const, header: "Supplier Name" },
    { key: "number" as const, header: "Number" },
    { key: "purchaseDate" as const, header: "Purchase Date" },
    { key: "purNo" as const, header: "Pur No" },
    { key: "taxableAmount" as const, header: "Taxable Amount" },
    { key: "gstAmount" as const, header: "GST Amount" },
    { key: "totalAmount" as const, header: "Total Amount" },
    { key: "narration" as const, header: "Narration" },
  ];

  const exportData = () =>
    data.map((r) => ({
      ...r,
      debitNoteDate: fmtDate(r.debitNoteDate),
      purchaseDate: fmtDate(r.purchaseDate),
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
    <Page title="Debit Note Complete">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title={`Debit Note - Complete (${docLabel})`}
          searchPlaceholder="Search debit note..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          hideFilterButton
          onBack={() => navigate("/accounting-master/debit-note/vendor-note")}
          onExportExcel={() =>
            exportToExcel(exportData(), exportColumns, "debit-note-complete")
          }
          onExportPdf={() =>
            exportToPdf(
              exportData(),
              exportColumns,
              `Debit Note - Complete (${docLabel})`,
              "debit-note-complete",
            )
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading..." : "No debit notes found."}
        />
      </div>
    </Page>
  );
}
