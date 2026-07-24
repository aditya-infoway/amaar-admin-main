import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input, Select } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { CashBookRow, CashBookSummary } from "../shared/types";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "CP", label: "Cash Payment" },
  { value: "CR", label: "Cash Receipt" },
];

export default function CashBookPage() {
  const [summary, setSummary] = useState<CashBookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [transactionType, setTransactionType] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const financialYearId = sessionStorage.getItem("financialYearId") || "";
      const response = await Get(
        "payment/cash-book",
        { financialYearId, transactionType, fromDate, toDate },
        false
      );
      if (response?.data?.success) {
        setSummary(response.data.data as CashBookSummary);
      } else {
        toasterrormsg(response?.data?.message || "Failed to fetch cash book.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching cash book.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType, fromDate, toDate]);

  const data: CashBookRow[] = summary?.list ?? [];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    getRowId: (row) => row.id,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const cardTotals = useMemo(
    () => ({
      totalReceipts: Number(summary?.totalReceipts ?? 0),
      totalPayments: Number(summary?.totalPayments ?? 0),
      closingBalance: Number(summary?.closingBalance ?? 0),
      totalTransactions: summary?.totalTransactions ?? 0,
    }),
    [summary]
  );

  // Cash balance is normally a Debit balance (cash in hand). If receipts fall
  // short of payments the balance goes negative — i.e. Credit — which in a
  // cash book means more cash was recorded going out than was ever in.
  const balance = useMemo(() => {
    const value = cardTotals.closingBalance;
    const isDr = value >= 0;
    return {
      sign: isDr ? "+" : "-",
      label: isDr ? "DR" : "CR",
      formatted: Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    };
  }, [cardTotals.closingBalance]);

  return (
    <Page title="Cash Book">
      <div className="transition-content w-full pb-5">
        {/* ---- Summary cards ---- */}
        <div className="grid grid-cols-1 gap-4 px-(--margin-x) pt-5 sm:grid-cols-3">
          <div className="from-info to-info-darker relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br p-3.5">
            <p className="text-xs text-sky-100 uppercase">Total Receipts</p>
            <div className="flex items-end justify-between space-x-2">
              <p className="mt-4 text-2xl font-medium text-white">
                ₹{cardTotals.totalReceipts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="truncate pb-0.5 text-xs font-medium text-sky-100">
                {cardTotals.totalTransactions} transactions
              </span>
            </div>
            <div className="mask is-reuleaux-triangle absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-amber-400 to-orange-600 p-3.5">
            <p className="text-xs text-amber-50 uppercase">Total Payments</p>
            <div className="flex items-end justify-between space-x-2">
              <p className="mt-4 text-2xl font-medium text-white">
                ₹{cardTotals.totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <span className="truncate pb-0.5 text-xs font-medium text-amber-50">
                {cardTotals.totalTransactions} transactions
              </span>
            </div>
            <div className="mask is-diamond absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-pink-500 to-rose-500 p-3.5">
            <p className="text-xs text-pink-100 uppercase">Closing Balance</p>
            <div className="flex items-end justify-between space-x-2">
              <p className="mt-4 text-2xl font-medium text-white">
                ₹{balance.formatted} {balance.label}
              </p>
              <span className="truncate pb-0.5 text-xs font-medium text-pink-100">
                {cardTotals.totalTransactions} transactions
              </span>
            </div>
            <div className="mask is-hexagon-2 absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>
        </div>

        <MasterToolbar
          title="Cash Book"
          searchPlaceholder="Voucher No, Party, Account, Narration..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() => exportToExcel(data, exportColumns, "cash_book")}
          onExportPdf={() => exportToPdf(data, exportColumns, "Cash Book", "cash_book")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Transaction Type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                {TRANSACTION_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading cash book..." : "No cash book entries found."}
        />

        {data.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-6 border-t-2 border-red-500 px-(--margin-x) py-3 text-sm font-semibold">
            <span>TOTAL —</span>
            <span className="text-emerald-600">
              ₹{cardTotals.totalReceipts.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-red-500">
              ₹{cardTotals.totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className={balance.label === "DR" ? "text-emerald-600" : "text-red-500"}>
              Bal: ₹{balance.formatted} {balance.label}
            </span>
          </div>
        )}
      </div>
    </Page>
  );
}