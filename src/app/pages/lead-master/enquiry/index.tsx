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
import { EnquiryDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Enquiry, emptyEnquiry } from "./data";

export default function EnquiryPage() {
  const [data, setData] = useState<Enquiry[]>(() =>
    masterStorage.getEnquiries(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.name.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (
        filterCity &&
        !item.city.toLowerCase().includes(filterCity.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterName, filterCity]);

  const persist = (next: Enquiry[]) => {
    setData(next);
    masterStorage.saveEnquiries(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Enquiry) => {
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
    <Page title="Enquiry Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Register"
          createLabel="Add Enquiry"
          searchPlaceholder="Search enquiries..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEnquiry());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "enquiries")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Enquiry List",
              "enquiries",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
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
          emptyMessage="No enquiries found. Click Add Enquiry to add one."
        />
      </div>

      <EnquiryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquiry={editing}
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