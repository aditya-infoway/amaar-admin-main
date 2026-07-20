import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { columns, exportColumns } from "./columns";
import { Account, mapApiAccountToAccount } from "../shared/types";

export default function AccountPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupOptions, setGroupOptions] = useState<{ id: string; label: string }[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterAccountName, setFilterAccountName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/account/list", {}, false);
      if (response.data?.success) {
        const mapped: Account[] = (response.data.data || []).map(mapApiAccountToAccount);
        setData(mapped);

        const uniqueGroups = Array.from(
          new Map(
            mapped
              .filter((item) => item.groupName)
              .map((item) => [item.groupName as string, { id: item.groupName as string, label: item.groupName as string }]),
          ).values(),
        );
        setGroupOptions(uniqueGroups);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch accounts.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching account data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterAccountName &&
        !item.accountName?.toLowerCase().includes(filterAccountName.toLowerCase())
      )
        return false;
      if (filterGroup && item.groupName !== filterGroup) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterAccountName, filterGroup, filterStatus]);

  // ---- Delete (single) ----
  const handleDeleteOne = async (row: Account) => {
    try {
      const response = await Delete(
        "master/account/delete",
        { accountId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Account deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete account.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the account.");
    }
  };

  // ---- Delete (bulk) ----
  const handleDeleteMany = async (rows: { original: Account }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/account/delete",
            { accountId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected accounts deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting accounts.");
    }
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
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
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
          emptyMessage={
            loading
              ? "Loading accounts..."
              : "No accounts found. Click Create Account to add one."
          }
        />
      </div>
    </Page>
  );
}