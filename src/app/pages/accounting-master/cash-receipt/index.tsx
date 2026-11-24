import { useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Get, GetBlob, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { CashReceiptDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { CashReceipt, emptyCashReceipt } from "./data";

// ✅ NEW — cash receipt list API
const cashReceiptApi = {
  list: (financialYearId: string) =>
    Get("payment/cash-receipt/list", { financialYearId }, false),
};

export default function CashReceiptPage() {
  const [data, setData] = useState<CashReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CashReceipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

  // ✅ NEW — API se list fetch
  const fetchCashReceipts = async () => {
    setLoading(true);
    try {
      const financialYearId = localStorage.getItem("financialYearId") || "";
      const res = await cashReceiptApi.list(financialYearId);
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load cash receipts.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong while loading cash receipts.",
      );
    } finally {
      setLoading(false);
    }
  };
const handlePrint = async (row: CashReceipt) => {

  const win = window.open("", "_blank");
if (win) {
  win.document.write(`
    <html>
      <head><title>Generating PDF...</title></head>
      <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;color:#475569;background:#f8fafc;">
        <div style="text-align:center">
          <div style="width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:#1e40af;border-radius:50%;margin:0 auto 12px;animation:s 0.8s linear infinite"></div>
          <div>Generating receipt, please wait...</div>
        </div>
        <style>@keyframes s{to{transform:rotate(360deg)}}</style>
      </body>
    </html>
  `);
} // popup blocker se bachne ke liye
  try {
    const res = await GetBlob(`payment/cash-receipt/print/${row.id}`);
    const blob = new Blob([res.data], { type: "application/pdf" });

    // PDF ki jagah JSON error aaya ho to uska message dikhao
    if (res.data.type && res.data.type !== "application/pdf") {
      const text = await res.data.text();
      let msg = "Unable to print cash receipt.";
      try {
        msg = JSON.parse(text)?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const url = URL.createObjectURL(blob);
    if (win) win.location.href = url;
    else window.open(url, "_blank");
  } catch (err: any) {
    win?.close();
    console.error(err);
    toasterrormsg(err?.message || "Unable to print cash receipt.");
  }
};
  useEffect(() => {
    fetchCashReceipts();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterVoucher &&
        !item.voucherNo.toLowerCase().includes(filterVoucher.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterVoucher]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: CashReceipt) => {
        setEditing(row);
        setDrawerOpen(true);
      },
        printRow: handlePrint,
      // Note: delete/edit ke liye backend endpoints abhi nahi banaye
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Cash Receipt">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Cash Receipt"
          createLabel="Add Cash Receipt"
          searchPlaceholder="Search cash receipts..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyCashReceipt());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "cash_receipts")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Cash Receipt List",
              "cash_receipts",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label="Voucher No"
                value={filterVoucher}
                onChange={(e) => setFilterVoucher(e.target.value)}
                placeholder="Filter by voucher number"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading cash receipts..." : "No cash receipts found. Click Add Cash Receipt to add one."}
        />
      </div>

      <CashReceiptDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        cashReceipt={editing}
        onSaved={fetchCashReceipts} // ✅ CHANGED — save hone ke baad list refresh
      />
    </Page>
  );
}