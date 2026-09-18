// src/app/pages/grr-list/index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { exportToExcel, exportToPdf } from "../shared/export";
import { TextCell } from "../shared/tableCells";

function formatDateForDisplay(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

type GrrRow = {
  id: string;
  grrNo: string;
  grrDate: string;
  poNumber: string;
  supplierName: string;
  supplierNumber: string;
  status: string;
};

export default function GrrList() {
  const navigate = useNavigate();
  const [data, setData] = useState<GrrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get("purchase-grr/list", { financialYearId }, false);
        if (res.data?.success) {
          setData(res.data.data || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load GRR list.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load GRR list.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grrColumns = [
    { accessorKey: "grrNo", header: "GRR No", cell: TextCell },
    {
      accessorKey: "grrDate",
      header: "GRR Date",
      cell: ({ getValue }: { getValue: () => string }) =>
        formatDateForDisplay(getValue()),
    },
    { accessorKey: "poNumber", header: "PO No", cell: TextCell },
    { accessorKey: "supplierName", header: "Supplier Name", cell: TextCell },
    { accessorKey: "supplierNumber", header: "Number", cell: TextCell },
    {
      id: "action",
      header: "Action",
      cell: ({ row }: { row: { original: GrrRow } }) => (
        <Button
          isIcon
          variant="flat"
          onClick={() => navigate("/purchase-master/purchase-grr/create")}
        >
          <EyeIcon className="size-4.5" />
        </Button>
      ),
    },
  ];

  const grrExportColumns = [
    { key: "grrNo" as const, header: "GRR No" },
    { key: "grrDate" as const, header: "GRR Date" },
    { key: "poNumber" as const, header: "PO No" },
    { key: "supplierName" as const, header: "Supplier Name" },
    { key: "supplierNumber" as const, header: "Number" },
  ];

  const table = useReactTable({
    data,
    columns: grrColumns,
    state: { globalFilter, sorting },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Purchase GRR">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Purchase GRR"
          createLabel="Create GRR"
          searchPlaceholder="Search GRR..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => navigate("/purchase-master/purchase-grr/create")}
          onExportExcel={() =>
            exportToExcel(
              data.map((g) => ({
                ...g,
                grrDate: formatDateForDisplay(g.grrDate),
              })),
              grrExportColumns,
              "grr-list",
            )
          }
          onExportPdf={() =>
            exportToPdf(
              data.map((g) => ({
                ...g,
                grrDate: formatDateForDisplay(g.grrDate),
              })),
              grrExportColumns,
              "GRR List",
              "grr-list",
            )
          }
        />
        <MasterTable
          table={table}
          columnCount={grrColumns.length}
          emptyMessage={
            loading ? "Loading GRR list..." : "No GRR records found."
          }
        />
      </div>
    </Page>
  );
}
