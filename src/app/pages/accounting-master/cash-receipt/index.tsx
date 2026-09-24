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
import { Get, toasterrormsg } from "@/ApiHelper";
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