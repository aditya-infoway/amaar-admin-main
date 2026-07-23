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
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Link, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { detailColumns, detailExportColumns } from "./detail-columns";
import { StockReportDetail, StockReportDetailRow } from "./data";

export default function StockReportDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const [data, setData] = useState<StockReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterPartyName, setFilterPartyName] = useState("");
  const [filterBillNo, setFilterBillNo] = useState("");

  useEffect(() => {
    if (!itemId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await Get(`stockreport/${itemId}`, {}, false);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          toasterrormsg(res.data?.message || "Failed to load stock history.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Something went wrong while loading stock history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

  const rows: StockReportDetailRow[] = data?.rows || [];

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (
        filterPartyName &&
        !row.partyName.toLowerCase().includes(filterPartyName.toLowerCase())
      )
        return false;
      if (
        filterBillNo &&
        !row.billNo.toLowerCase().includes(filterBillNo.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, filterPartyName, filterBillNo]);

  const table = useReactTable({
    data: filteredRows,
    columns: detailColumns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Stock History">
    <div className="transition-content w-full pb-5">
        <div className="flex items-center justify-between py-5 px-5 lg:py-6 lg:px-6">
          <h2 className="dark:text-dark-50 border-primary text-primary border-b-4 text-xl font-bold tracking-wide lg:text-1xl">
            {data ? `Stock History — ${data.itemName}` : "Stock History"}
          </h2>
          <Link to="/stock-report">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        <MasterToolbar
          title="Stock History"
          searchPlaceholder="Search bill no, party name..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(filteredRows, detailExportColumns, "stock-history")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredRows,
              detailExportColumns,
              `Stock History — ${data?.itemName || ""}`,
              "stock-history",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Party Name"
                value={filterPartyName}
                onChange={(e) => setFilterPartyName(e.target.value)}
                placeholder="Filter by party name"
              />
              <Input
                label="Bill No"
                value={filterBillNo}
                onChange={(e) => setFilterBillNo(e.target.value)}
                placeholder="Filter by bill no"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={detailColumns.length}
          emptyMessage={
            loading
              ? "Loading stock history..."
              : "No stock history with remaining stock found."
          }
        />
      </div>
    </Page>
  );
}