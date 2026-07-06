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
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { statusOptions } from "../shared/constants";
import { ProfessionDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Profession, emptyProfession } from "./data";

export default function ProfessionPage() {
  const [data, setData] = useState<Profession[]>(() =>
    masterStorage.getProfessions(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Profession | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCode &&
        !item.code.toLowerCase().includes(filterCode.toLowerCase())
      )
        return false;
      if (
        filterName &&
        !item.professionName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCode, filterName, filterStatus]);

  const persist = (next: Profession[]) => {
    setData(next);
    masterStorage.saveProfessions(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Profession) => {
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
    <Page title="Profession">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Profession"
          createLabel="Create Profession"
          searchPlaceholder="Search professions..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyProfession());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "professions")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Profession List",
              "professions",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
              />
              <Input
                label="Profession"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by profession"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={
                  [{ id: "", label: "All" }, ...statusOptions].find(
                    (item) => item.id === filterStatus,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No professions found. Click Create Profession to add one."
        />
      </div>

      <ProfessionDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        profession={editing}
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