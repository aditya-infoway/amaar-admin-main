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
import { BankReceiptDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { BankReceipt, emptyBankReceipt } from "./data";

// ✅ NEW — bank receipt list API
const bankReceiptApi = {
  list: (financialYearId: string) =>
    Get("payment/bank-receipt/list", { financialYearId }, false),
};

export default function BankReceiptPage() {
  const [data, setData] = useState<BankReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BankReceipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

  // ✅ NEW — API se list fetch
  const fetchBankReceipts = async () => {
    setLoading(true);
    try {
      const financialYearId = localStorage.getItem("financialYearId") || "";
      const res = await bankReceiptApi.list(financialYearId);
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load bank receipts.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong while loading bank receipts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankReceipts();
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
      openEditDrawer: (row: BankReceipt) => {
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
    <Page title="Bank Receipt">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Bank Receipt"
          createLabel="Add Bank Receipt"
          searchPlaceholder="Search bank receipts..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyBankReceipt());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "bank_receipts")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Bank Receipt List",
              "bank_receipts",
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
          emptyMessage={loading ? "Loading bank receipts..." : "No bank receipts found. Click Add Bank Receipt to add one."}
        />
      </div>

      <BankReceiptDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        bankReceipt={editing}
        onSaved={fetchBankReceipts} // ✅ CHANGED — save hone ke baad list refresh
      />
    </Page>
  );
}