import  { useMemo, useState } from "react";
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
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { CashReceiptDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { CashReceipt, emptyCashReceipt } from "./data";

export default function CashReceiptPage() {
  const [data, setData] = useState<CashReceipt[]>(() =>
    masterStorage.getCashReceipts(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CashReceipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

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

  const persist = (next: CashReceipt[]) => {
    setData(next);
    masterStorage.saveCashReceipts(next);
  };

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
      deleteRow: (row) => {
        persist(data.filter((item) => item.id !== row.original.id));
      },
      deleteRows: (rows) => {
        const ids = new Set(rows.map((r) => r.original.id));
        persist(data.filter((item) => !ids.has(item.id)));
        setRowSelection({});
      },
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
          emptyMessage="No cash receipts found. Click Add Cash Receipt to add one."
        />
      </div>

      <CashReceiptDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        cashReceipt={editing}
        onSave={(item) => {
          const exists = data.some((row) => row.id === item.id);
          persist(
            exists
              ? data.map((row) => (row.id === item.id ? item : row))
              : [item, ...data],
          );
        }}
      />
    </Page>
  );
}