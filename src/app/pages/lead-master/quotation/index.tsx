import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { QuotationDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Quotation, emptyQuotation } from "./data";

export default function QuotationPage() {
  const [data, setData] = useState<Quotation[]>(() =>
    masterStorage.getQuotations(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCustomer &&
        !item.customerName
          .toLowerCase()
          .includes(filterCustomer.toLowerCase())
      )
        return false;
      if (
        filterCity &&
        !item.city.toLowerCase().includes(filterCity.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterCustomer, filterCity]);

  const persist = (next: Quotation[]) => {
    setData(next);
    masterStorage.saveQuotations(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Quotation) => {
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
    <Page title="Quotation">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Quotation"
          createLabel="Add Quotation"
          searchPlaceholder="Search quotations..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyQuotation());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "quotations")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Quotation List",
              "quotations",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Customer Name"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                placeholder="Filter by customer name"
              />
              <Input
                label="City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Filter by city"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No quotations found. Click Add Quotation to add one."
        />
      </div>

      <QuotationDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        quotation={editing}
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