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

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Get,
  Post,
  Put,
  Delete,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { AccountGroupDrawer } from "./AccountGroupModal";
import { createColumns, exportColumns } from "./columns";
import {
  AccountGroup,
  emptyAccountGroup,
  formatCreatedDate,
  formatCreatedTime,
  mapApiAccountGroupToAccountGroup,
} from "./data";

interface GroupOption {
  id: string;
  label: string;
}

export default function AccountGroupPage() {
  const [data, setData] = useState<AccountGroup[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountGroup | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [groupRes, accountGroupRes] = await Promise.all([
        Get("master/group/list", {}, false),
        Get("master/account-group/list", {}, false),
      ]);

      const groups: any[] = groupRes?.data?.data || groupRes?.data || [];
      setGroupOptions(
        groups.map((g) => ({ id: String(g.id), label: g.groupName })),
      );

      if (accountGroupRes.data?.success) {
        setData(
          (accountGroupRes.data.data || []).map(
            mapApiAccountGroupToAccountGroup,
          ),
        );
      } else {
        toasterrormsg(
          accountGroupRes.data?.message || "Failed to fetch account groups.",
        );
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching account groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const columns = useMemo(() => createColumns(), []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.groupName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterGroup && item.groupId !== filterGroup) return false;
      return true;
    });
  }, [data, filterName, filterGroup]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    createdDate: formatCreatedDate(row.created),
    createdTime: formatCreatedTime(row.created),
  }));

  const handleSave = async (item: AccountGroup) => {
    const payload = {
      groupName: item.groupName.trim(),
      groupId: Number(item.groupId),
      status: item.status || "active",
    };

    try {
      const response = item.id
        ? await Put(
            "master/account-group/update",
            { accountGroupId: Number(item.id), ...payload },
            false,
          )
        : await Post("master/account-group/create", payload, false);

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            (item.id
              ? "Account group updated successfully."
              : "Account group created successfully."),
        );
        fetchAll();
      } else {
        toasterrormsg(
          response.data?.message || "Failed to save account group.",
        );
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the account group.");
    }
  };

  const handleDeleteOne = async (row: AccountGroup) => {
    try {
      const response = await Delete(
        "master/account-group/delete",
        { accountGroupId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Account group deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(
          response.data?.message || "Failed to delete account group.",
        );
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the account group.");
    }
  };

  // Backend delete block karta hai agar accounts use kar rahe hon, isliye har result check karo
  const handleDeleteMany = async (rows: { original: AccountGroup }[]) => {
    try {
      const results = await Promise.all(
        rows.map((r) =>
          Delete(
            "master/account-group/delete",
            { accountGroupId: Number(r.original.id) },
            false,
          ),
        ),
      );
      const failed = results.filter((r) => !r.data?.success);
      if (failed.length === 0) {
        toastsuccessmsg("Selected account groups deleted successfully.");
      } else {
        toasterrormsg(
          failed[0].data?.message ||
            `${failed.length} account group(s) could not be deleted.`,
        );
      }
      setRowSelection({});
      fetchAll();
    } catch (error) {
      toasterrormsg("Something went wrong while deleting account groups.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: AccountGroup) => {
        setEditing(row);
        setModalOpen(true);
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
    <Page title="Account Group">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Account Group"
          createLabel="Add Account Group"
          searchPlaceholder="Search account groups..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyAccountGroup());
            setModalOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "account-groups")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Account Group List",
              "account-groups",
            )
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading account groups..."
              : "No account groups found. Click Add Account Group to add one."
          }
        />
      </div>

      <AccountGroupDrawer
        isOpen={modalOpen}
        close={() => setModalOpen(false)}
        accountGroup={editing}
        groupOptions={groupOptions}
        onSave={handleSave}
      />
    </Page>
  );
}
