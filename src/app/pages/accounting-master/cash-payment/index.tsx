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
import { Input } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { CashPaymentDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { CashPayment } from "./data";

export default function CashPaymentPage() {
  const [data, setData] = useState<CashPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const financialYearId = sessionStorage.getItem("financialYearId") || "";
      const response = await Get("payment/cash/list", { financialYearId }, false);
      if (response?.data?.success) {
        setData(response.data.data || []);
      } else {
        toasterrormsg(response?.data?.message || "Failed to fetch cash payments.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching cash payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterVoucher && !item.voucherNo.toLowerCase().includes(filterVoucher.toLowerCase())) return false;
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
      // Delete abhi working nahi — sirf UI me option dikhta he
      deleteRow: () => toasterrormsg("Delete is not available yet."),
      deleteRows: () => toasterrormsg("Delete is not available yet."),
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
    <Page title="Cash Payment">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Cash Payment"
          createLabel="Add Cash Payment"
          searchPlaceholder="Search cash payments..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => setDrawerOpen(true)}
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "cash_payments")}
          onExportPdf={() => exportToPdf(filteredData, exportColumns, "Cash Payment List", "cash_payments")}
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
          emptyMessage={loading ? "Loading cash payments..." : "No cash payments found. Click Add Cash Payment to add one."}
        />
      </div>

      <CashPaymentDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
      />
    </Page>
  );
}