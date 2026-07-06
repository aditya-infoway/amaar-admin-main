import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { JournalEntryDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { JournalEntry, emptyJournalEntry } from "./data";

export default function JournalEntryPage() {
  const [data, setData] = useState<JournalEntry[]>(() =>
    masterStorage.getJournalEntries(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterVoucher, setFilterVoucher] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterVoucher &&
        !item.voucherNo.toLowerCase().includes(filterVoucher.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterVoucher]);

  const persist = (next: JournalEntry[]) => {
    setData(next);
    masterStorage.saveJournalEntries(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: JournalEntry) => {
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
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Journal Entry">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Journal Entry"
          createLabel="Add Journal Entry"
          searchPlaceholder="Search journal entries..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyJournalEntry());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "journal_entries")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Journal Entry List",
              "journal_entries",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label="Voucher No"
                value={filterVoucher}
                onChange={(e) => setFilterVoucher(e.target.value)}
                placeholder="Filter by voucher number"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No journal entries found. Click Add Journal Entry to add one."
        />
      </div>

      <JournalEntryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        journalEntry={editing}
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