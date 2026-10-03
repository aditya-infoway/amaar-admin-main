import { useEffect, useState } from "react";
import {
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
  supplierName: string;
  supplierInvoiceNo: string;
  invoiceDate: string;
  reason: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  createdBy: string;
  created: string;
};

// YYYY-MM-DD -> DD-MM-YYYY
function fmtDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

// ISO timestamp -> DD-MM-YYYY hh:mm AM/PM
function fmtDateTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${fmtDate(value)} ${time}`;
}

const amountCell = ({ getValue }: { getValue: () => number }) => (
  <span className="block text-right">{Number(getValue() || 0).toFixed(2)}</span>
);

export default function DebitNoteRegister() {
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
          "debit-note/register",
          { financialYearId },
          false,
        );
        if (res.data?.success) setData(res.data.data || []);
        else toasterrormsg(res.data?.message || "Failed to load register.");
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load register.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    { accessorKey: "debitNoteNo", header: "Debit Note No", cell: TextCell },
    {
      accessorKey: "debitNoteDate",
      header: "Date",
      cell: ({ getValue }: { getValue: () => string }) => fmtDate(getValue()),
    },
    { accessorKey: "supplierName", header: "Supplier", cell: TextCell },
    {
      accessorKey: "supplierInvoiceNo",
      header: "Supplier Invoice No",
      cell: TextCell,
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: ({ getValue }: { getValue: () => string }) => fmtDate(getValue()),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ getValue }: { getValue: () => string }) => getValue() || "-",
    },
    { accessorKey: "taxableAmount", header: "Taxable Amount", cell: amountCell },
    { accessorKey: "gstAmount", header: "GST", cell: amountCell },
    { accessorKey: "totalAmount", header: "Total Amount", cell: amountCell },
    { accessorKey: "createdBy", header: "Created By", cell: TextCell },
    {
      accessorKey: "created",
      header: "Time / Date",
      cell: ({ getValue }: { getValue: () => string }) =>
        fmtDateTime(getValue()),
    },
  ];

  const exportColumns = [
    { key: "debitNoteNo" as const, header: "Debit Note No" },
    { key: "debitNoteDate" as const, header: "Date" },
    { key: "supplierName" as const, header: "Supplier" },
    { key: "supplierInvoiceNo" as const, header: "Supplier Invoice No" },
    { key: "invoiceDate" as const, header: "Invoice Date" },
    { key: "reason" as const, header: "Reason" },
    { key: "taxableAmount" as const, header: "Taxable Amount" },
    { key: "gstAmount" as const, header: "GST" },
    { key: "totalAmount" as const, header: "Total Amount" },
    { key: "createdBy" as const, header: "Created By" },
    { key: "created" as const, header: "Time / Date" },
  ];

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

  const exportData = () =>
    data.map((r) => ({
      ...r,
      debitNoteDate: fmtDate(r.debitNoteDate),
      invoiceDate: fmtDate(r.invoiceDate),
      created: fmtDateTime(r.created),
    }));

  return (
    <Page title="Debit Note Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Debit Note Register"
          searchPlaceholder="Search debit note..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() =>
            exportToExcel(exportData(), exportColumns, "debit-note-register")
          }
          onExportPdf={() =>
            exportToPdf(
              exportData(),
              exportColumns,
              "Debit Note Register",
              "debit-note-register",
            )
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading register..." : "No debit notes found."
          }
        />
      </div>
    </Page>
  );
}