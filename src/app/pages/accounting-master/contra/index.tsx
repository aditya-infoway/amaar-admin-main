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
import { ContraDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Contra, emptyContra } from "./data";

// ✅ NEW — contra list API
const contraApi = {
  list: (financialYearId: string) =>
    Get("payment/contra/list", { financialYearId }, false),
};

export default function ContraPage() {
  const [data, setData] = useState<Contra[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Contra | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

  // ✅ NEW — API se list fetch
  const fetchContras = async () => {
    setLoading(true);
    try {
      const financialYearId = localStorage.getItem("financialYearId") || "";
      const res = await contraApi.list(financialYearId);
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load contras.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong while loading contras.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContras();
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
      openEditDrawer: (row: Contra) => {
        setEditing(row);
        setDrawerOpen(true);
      },
      // ✅ Note: delete/edit ke liye backend endpoints abhi nahi banaye —
      // agar chahiye to bata dena, add kar dunga
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
    <Page title="Contra">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Contra"
          createLabel="Add Contra"
          searchPlaceholder="Search contras..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyContra());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "contras")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Contra List",
              "contras",
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
          emptyMessage={loading ? "Loading contras..." : "No contras found. Click Add Contra to add one."}
        />
      </div>

      <ContraDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        contra={editing}
        onSaved={fetchContras} // ✅ CHANGED — save hone ke baad list refresh
      />
    </Page>
  );
}