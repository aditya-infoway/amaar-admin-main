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
import { EnquiryStatusDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { EnquiryStatus, emptyEnquiryStatus } from "./data";

export default function EnquiryStatusPage() {
  const [data, setData] = useState<EnquiryStatus[]>(() =>
    masterStorage.getEnquiryStatuses(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EnquiryStatus | null>(null);
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
        !item.statusName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterCode, filterName, filterStatus]);

  const persist = (next: EnquiryStatus[]) => {
    setData(next);
    masterStorage.saveEnquiryStatuses(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: EnquiryStatus) => {
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
    <Page title="Enquiry Status">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Status"
          createLabel="Create Enquiry Status"
          searchPlaceholder="Search enquiry statuses..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEnquiryStatus());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "enquiry-statuses")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Enquiry Status List",
              "enquiry-statuses",
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
                label="Enquiry Status Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by status name"
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
          emptyMessage="No enquiry statuses found. Click Create Enquiry Status to add one."
        />
      </div>

      <EnquiryStatusDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquiryStatus={editing}
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