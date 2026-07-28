import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../shared/export";
import { MasterTable } from "../../shared/MasterTable";
import { MasterToolbar } from "../../shared/MasterToolbar";
import { ledgerDetailColumns, ledgerDetailExportColumns } from "./columns";
import { LedgerDetailSummary } from "../../shared/types";

const toDateInputValue = (dates: Date[]) => {
  const picked = dates?.[0];
  if (!picked) return "";
  const yyyy = picked.getFullYear();
  const mm = String(picked.getMonth() + 1).padStart(2, "0");
  const dd = String(picked.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function LedgerReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [summary, setSummary] = useState<LedgerDetailSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

  const fetchDetails = async (from: string, to: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const financialYearId = sessionStorage.getItem("financialYearId") || "";
      const response = await Get(
        "ledger-report/details",
        { accountId: id, fromDate: from, toDate: to, financialYearId },
        false
      );
      if (response?.data?.success) {
        setSummary(response.data.data as LedgerDetailSummary);
      } else {
        toasterrormsg(response?.data?.message || "Failed to fetch ledger details.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching ledger details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = () => fetchDetails(fromDate, toDate);
  const handleClear = () => {
    setFromDate("");
    setToDate("");
    fetchDetails("", "");
  };

  const data = summary?.list ?? [];

  const table = useReactTable({
    data,
    columns: ledgerDetailColumns,
    state: { globalFilter, sorting },
    getRowId: (row) => String(row.sr),
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const cardTotals = useMemo(
    () => ({
      opening: summary?.openingBalanceLabel ?? "—",
      totalDebit: Number(summary?.totalDebit ?? 0),
      totalCredit: Number(summary?.totalCredit ?? 0),
      closing: summary?.closingBalanceLabel ?? "—",
    }),
    [summary]
  );

  return (
    <Page title="Ledger Details">
      <div className="transition-content w-full pb-5">
        <div className="flex items-center justify-between px-(--margin-x) pt-5">
          <div>
            <h2 className="text-lg font-medium">{summary?.account.accountName || "Ledger Details"}</h2>
            {summary && (
              <p className="text-sm text-slate-500">
                {summary.account.groupName} · Opening: {summary.openingBalanceLabel}
              </p>
            )}
          </div>
          <Button
            onClick={() => navigate("/accounting-master/ledger-report")}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Back
          </Button>
        </div>

        {/* ---- Date range ---- */}
        <div className="flex flex-wrap items-end gap-4 px-(--margin-x) pt-5">
          <div className="w-48">
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(dates: Date[]) => setFromDate(toDateInputValue(dates))}
              placeholder="Choose date..."
            />
          </div>
          <div className="w-48">
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(dates: Date[]) => setToDate(toDateInputValue(dates))}
              placeholder="Choose date..."
            />
          </div>
          <Button onClick={handleApply} className="bg-red-600 text-white hover:bg-red-700 focus:bg-red-700">
            Apply
          </Button>
          <Button onClick={handleClear}>Clear</Button>
        </div>

        {/* ---- Summary cards ---- */}
        <div className="grid grid-cols-1 gap-4 px-(--margin-x) pt-5 sm:grid-cols-4">
          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 p-3.5">
            <p className="text-xs text-violet-100 uppercase">Opening Balance</p>
            <p className="mt-4 text-2xl font-medium text-white">{cardTotals.opening}</p>
            <div className="mask is-hexagon-2 absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

          <div className="from-info to-info-darker relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br p-3.5">
            <p className="text-xs text-sky-100 uppercase">Total Debit</p>
            <p className="mt-4 text-2xl font-medium text-white">
              ₹{cardTotals.totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="mask is-reuleaux-triangle absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-amber-400 to-orange-600 p-3.5">
            <p className="text-xs text-amber-50 uppercase">Total Credit</p>
            <p className="mt-4 text-2xl font-medium text-white">
              ₹{cardTotals.totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="mask is-diamond absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-lg bg-linear-to-br from-pink-500 to-rose-500 p-3.5">
            <p className="text-xs text-pink-100 uppercase">Closing Balance</p>
            <p className="mt-4 text-2xl font-medium text-white">{cardTotals.closing}</p>
            <div className="mask is-hexagon-2 absolute top-0 right-0 -m-3 size-16 bg-white/20"></div>
          </div>
        </div>

        <MasterToolbar
          title="Ledger Entries"
          searchPlaceholder="Voucher, Particulars..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() => exportToExcel(data, ledgerDetailExportColumns, "ledger_details")}
          onExportPdf={() => exportToPdf(data, ledgerDetailExportColumns, "Ledger Details", "ledger_details")}
        />

        <MasterTable
          table={table}
          columnCount={ledgerDetailColumns.length}
          emptyMessage={loading ? "Loading ledger details..." : "No entries found."}
        />

        {data.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-6 border-t-2 border-primary px-(--margin-x) py-3 text-sm font-semibold">
            <span>TOTAL —</span>
            <span className="text-emerald-600">
              ₹{cardTotals.totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-amber-600">
              ₹{cardTotals.totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className={cardTotals.closing.endsWith("DR") ? "text-primary" : "text-red-500"}>
              Bal: {cardTotals.closing}
            </span>
          </div>
        )}
      </div>
    </Page>
  );
}