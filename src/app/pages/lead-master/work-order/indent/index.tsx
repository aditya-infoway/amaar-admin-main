import {
  ColumnDef,
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

import { Get,  } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import IndentDrawer from "./IndentDrawer";

import { createColumns, createExportColumns } from "./columns";
import type { Indent } from "./types";



export default function IndentPage() {
  const [data, setData] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<Indent | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndentNo, setFilterIndentNo] = useState("");
  const [filterWorkOrderId, setFilterWorkOrderId] = useState("");

  const fetchIndents = async () => {
    try {
      setLoading(true);

      const financialYearId = localStorage.getItem("financialYearId");

      const response = await Get(
        "indent/list", // ← change API endpoint if different
        financialYearId ? { financialYearId } : {},
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        setData(
          (response?.data?.data || []).map((item: Indent) => ({
            ...item,
            id: String(item.id),
          })),
        );
      }
    } catch (error) {
      console.error("Indent list error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterIndentNo &&
        !String(item.indentNo || "")
          .toLowerCase()
          .includes(filterIndentNo.toLowerCase())
      ) {
        return false;
      }

      if (
        filterWorkOrderId &&
        !String(item.workOrderNo || item.workOrderId || "")
          .toLowerCase()
          .includes(filterWorkOrderId.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [data, filterIndentNo, filterWorkOrderId]);

  const columns = useMemo(
    () => createColumns() as ColumnDef<Indent, any>[],
    [],
  );
  const exportColumns = useMemo(() => createExportColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),

    meta: {
    viewRow: async (row: Indent) => {
  setDrawerOpen(true);
  setViewing(row); // show header immediately while items load

  try {
    const response = await Get(`indent/${row.id}`, {}, false);
    if (response?.data?.success || response?.data?.status === 200) {
      const full = response?.data?.data;
      setViewing({
        ...row,
        ...full,
        date: full?.created || row.date,
        items: (full?.items || []).map((it: any) => ({
          id: it.indentItemId,
          itemCode: it.itemCode,
          itemName: it.itemName,
          unit: it.unit,
          requiredQty: it.requiredStock,
        })),
      });
    }
  } catch (error) {
    console.error("Indent detail fetch error:", error);
  }
},
      // No edit / delete as per your requirement
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
    <Page title="Material Availability / Indent">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Indent"
          createLabel="" // no create button
          onCreate={() => undefined}
          searchPlaceholder="Search indents..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          // No onCreate
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "indents")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Material Availability Report",
              "indents",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Indent No"
                value={filterIndentNo}
                onChange={(e) => setFilterIndentNo(e.target.value)}
                placeholder="Filter by Indent No"
              />
              <Input
                label="Work Order ID"
                value={filterWorkOrderId}
                onChange={(e) => setFilterWorkOrderId(e.target.value)}
                placeholder="Filter by Work Order ID"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No Indents found."
        />
      </div>

      <IndentDrawer
        isOpen={drawerOpen}
        close={() => {
          setDrawerOpen(false);
          setViewing(null);
        }}
        indent={viewing}
      />
    </Page>
  );
}