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
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage"; // Fixed import
import { columns, exportColumns } from "./columns";
import { Account } from "../shared/types";
import { groupOptions, statusOptions } from "../shared/constants";

export default function AccountPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Account[]>(() =>
    masterStorage.getAccounts(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterAccountName, setFilterAccountName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterAccountName &&
        !item.accountName.toLowerCase().includes(filterAccountName.toLowerCase())
      )
        return false;
      if (filterGroup && item.group !== filterGroup) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterAccountName, filterGroup, filterStatus]);

  const persist = (next: Account[]) => {
    setData(next);
    masterStorage.saveAccounts(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Account) => {
        navigate(`/user-master/accounts/edit/${row.id}`);
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
    <Page title="Account">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Account"
          createLabel="Create Account"
          searchPlaceholder="Search accounts..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/user-master/accounts/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "accounts")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Account List",
              "accounts",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Account Name"
                value={filterAccountName}
                onChange={(e) => setFilterAccountName(e.target.value)}
                placeholder="Filter by account name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...groupOptions]}
                value={
                  [{ id: "", label: "All" }, ...groupOptions].find(
                    (item) => item.id === filterGroup,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterGroup(item.id)}
                label="Group"
                placeholder="All groups"
                displayField="label"
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
          emptyMessage="No accounts found. Click Create Account to add one."
        />
      </div>
    </Page>
  );
}