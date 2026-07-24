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
import { BankBookRow, BankBookSummary } from "../shared/types";

const TRANSACTION_TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "BP", label: "Bank Payment" },
  { value: "BR", label: "Bank Receipt" },
];

export default function BankBookPage() {
  const [summary, setSummary] = useState<BankBookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [transactionType, setTransactionType] = useState("ALL");
  const [bankAccountId, setBankAccountId] = useState("ALL");
  const [bankAccountOptions, setBankAccountOptions] = useState<{ id: string; label: string }[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---- Bank account dropdown ke liye real accounts fetch karo ----
  useEffect(() => {
    (async () => {
      try {
        const res = await Get("master/account/bank/list", {}, false);
        const list = res?.data?.data || [];
        setBankAccountOptions(list.map((a: any) => ({ id: String(a.id), label: a.accountName })));
      } catch (err) {
        toasterrormsg("Failed to load bank accounts");
      }
    })();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const financialYearId = sessionStorage.getItem("financialYearId") || "";
      const response = await Get(
        "payment/bank-book",
        { financialYearId, transactionType, bankAccountId, fromDate, toDate },
        false
      );
      if (response?.data?.success) {
        setSummary(response.data.data as BankBookSummary);
      } else {
        toasterrormsg(response?.data?.message || "Failed to fetch bank book.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching bank book.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType, bankAccountId, fromDate, toDate]);

  const data: BankBookRow[] = summary?.list ?? [];

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
      openingBalance: summary?.openingBalance ?? null,
      totalReceipts: Number(summary?.totalReceipts ?? 0),
      totalPayments: Number(summary?.totalPayments ?? 0),
      closingBalance: Number(summary?.closingBalance ?? 0),
      totalTransactions: summary?.totalTransactions ?? 0,
      multipleBanks: summary?.multipleBanks ?? true,
    }),
    [summary]
  );

  const balance = useMemo(() => {
    const value = cardTotals.closingBalance;
    const isDr = value >= 0;
    return {
      label: isDr ? "DR" : "CR",
      formatted: Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    };
  }, [cardTotals.closingBalance]);

  const openingDisplay = useMemo(() => {
    if (cardTotals.openingBalance == null) return null;
    const value = Number(cardTotals.openingBalance);
    const isDr = value >= 0;
    return {
      label: isDr ? "DR" : "CR",
      formatted: Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    };
  }, [cardTotals.openingBalance]);

  return (
    <Page title="Bank Book">
      <div className="transition-content w-full pb-5">
        {/* ---- Summary cards (4 cards — Opening Balance bhi) ---- */}
        <div className="grid grid-cols-1 gap-4 px-(--margin-x) pt-5 sm:grid-cols-4">
          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 p-3.5">
            <p className="text-xs text-violet-100 uppercase">Opening Balance</p>

            <div className="flex items-end justify-between space-x-2">
              {openingDisplay ? (
                <p className="mt-4 text-2xl font-medium text-white">
                  ₹{openingDisplay.formatted} {openingDisplay.label}
                </p>
              ) : (
                <p className="mt-4 text-lg font-medium text-violet-100">—</p>
              )}

              <span className="truncate pb-0.5 text-xs font-medium text-violet-100">
                {cardTotals.totalTransactions} transactions
              </span>
            </div>

            {cardTotals.multipleBanks && (
              <span className="mt-1 text-xs text-violet-100">
                Multiple banks selected
              </span>
            )}

            <div className="mask is-hexagon-2 absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

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
          title="Bank Book"
          searchPlaceholder="Voucher No, Account, Narration..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() => exportToExcel(data, exportColumns, "bank_book")}
          onExportPdf={() => exportToPdf(data, exportColumns, "Bank Book", "bank_book")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-4">
              <Select
                label="Bank Account"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
              >
                <option value="ALL">All Banks</option>
                {bankAccountOptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </Select>
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
          emptyMessage={loading ? "Loading bank book..." : "No bank book entries found."}
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