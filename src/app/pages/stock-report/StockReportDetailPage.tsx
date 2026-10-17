import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Link, useParams } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { StockReportDetail } from "./data";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MasterTable } from "./shared/MasterTable";
import { detailColumns } from "./detail-columns";

export default function StockReportDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const [data, setData] = useState<StockReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const res = await Get(`stockreport/${itemId}`, {}, false);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toasterrormsg(res.data?.message || "Failed to load stock history.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message ||
          "Something went wrong while loading stock history.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const rows = data?.rows || [];

  const table = useReactTable({
    data: rows,
    columns: detailColumns,
    enableSorting: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Stock History">
      <div className="transition-content w-full pb-5">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center gap-3">
            <Link to="/stock-report">
              <Button color="primary" variant="outlined" className="gap-1">
                <ChevronLeftIcon className="size-5" />
                Back to Stock
              </Button>
            </Link>
            <h2 className="text-primary dark:text-dark-50 text-xl font-bold tracking-wide">
              {data ? data.itemName : "Stock History"}
            </h2>
          </div>

          <Button
            color="primary"
            variant="outlined"
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Top Cards - Current Stock / Purchase Price / Unit */}
        <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-3 lg:px-6">
          <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white shadow">
            <p className="text-sm opacity-90">Current Stock</p>
            <p className="mt-1 text-3xl font-bold">
              {data && "currentStock" in data
                ? String(data.currentStock ?? "—")
                : "—"}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white shadow">
            <p className="text-sm opacity-90">Purchase Price</p>
            <p className="mt-1 text-3xl font-bold">
              {data && "purchasePrice" in data && data.purchasePrice != null
                ? `₹${data.purchasePrice}`
                : "—"}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 p-5 text-white shadow">
            <p className="text-sm opacity-90">Unit</p>
            <p className="mt-1 text-3xl font-bold">{data?.unit ?? "—"}</p>
          </div>
        </div>

        {/* Item Details */}
        <div className="mt-6 px-5 lg:px-6">
          <h3 className="dark:text-dark-100 mb-3 text-base font-semibold text-gray-700">
            Item Details
          </h3>
          <div className="dark:border-dark-600 dark:bg-dark-700 grid grid-cols-2 gap-x-8 gap-y-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                HSN Code
              </p>
              <p className="mt-1 font-medium">{data?.hsnCode || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                Category
              </p>
              <p className="mt-1 font-medium">{data?.category || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                Group
              </p>
              <p className="mt-1 font-medium">{data?.group || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                Item Name
              </p>
              <p className="mt-1 font-medium">{data?.itemName || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                Item Code
              </p>
              <p className="mt-1 font-medium">{data?.itemCode || "—"}</p>
            </div>
          </div>
        </div>

        {/* Stock History Table */}
        <div className="mt-8 px-5 lg:px-6">
          <h3 className="dark:text-dark-100 mb-3 text-base font-semibold text-gray-700">
            Stock History{" "}
            <span className="text-sm font-normal text-gray-500">
              ({rows.length} transactions)
            </span>
          </h3>

          <MasterTable
            table={table}
            columnCount={10}
            emptyMessage={
              loading ? "Loading stock history..." : "No stock history found."
            }
          />
        </div>
      </div>
    </Page>
  );
}
