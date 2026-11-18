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
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
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
import { statusOptions } from "../shared/constants";
import { SubGroupDrawer } from "./SubgroupDrawer";
import { columns, exportColumns } from "./columns";
import { emptySubGroup, mapApiSubGroupToSubGroup, SubGroup } from "./data";

export default function SubGroupPage() {
  const [data, setData] = useState<SubGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubGroup | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Category / Group ke naam table me dikhane ke liye
  const [categoryOptions, setCategoryOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [groupOptions, setGroupOptions] = useState<
    { id: string; label: string }[]
  >([]);

  const fetchLookups = async () => {
    try {
      const res = await Get("master/itemcategory/list", {}, false);
      const list = res?.data?.data || [];
      setCategoryOptions(
        list.map((c: any) => ({
          id: String(c.itemCategoryId),
          label: c.categoryName,
        })),
      );
    } catch (error) {
      // ignore, table "-" dikhayegi
    }

    try {
      const res = await Get("master/itemgroup/list", {}, false);
      const list = res?.data?.data || [];
      setGroupOptions(
        list.map((g: any) => ({
          id: String(g.itemGroupId),
          label: g.groupName,
        })),
      );
    } catch (error) {
      // ignore, table "-" dikhayegi
    }
  };

  // ---- Fetch sub groups ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/subgroup/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiSubGroupToSubGroup));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch sub groups.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching sub group data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category / Group ke naam merge karo + filters
  const filteredData = useMemo(() => {
    return data
      .map((item) => ({
        ...item,
        categoryName:
          item.categoryName ||
          categoryOptions.find((c) => c.id === item.itemCategoryId)?.label ||
          "",
        groupName:
          item.groupName ||
          groupOptions.find((g) => g.id === item.groupId)?.label ||
          "",
      }))
      .filter((item) => {
        if (
          filterName &&
          !item.subGroupName.toLowerCase().includes(filterName.toLowerCase())
        )
          return false;
        if (filterStatus && item.status !== filterStatus) return false;
        return true;
      });
  }, [data, categoryOptions, groupOptions, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: SubGroup) => {
    const payload: any = {
      subGroupName: item.subGroupName,
      itemCategoryId: Number(item.itemCategoryId),
      groupId: Number(item.groupId),
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/subgroup/update",
          { subGroupId: Number(item.id), ...payload },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Sub group updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update sub group.");
        }
      } else {
        // ===== companyId localStorage se, createdType default "Super Admin" =====
        const companyId = localStorage.getItem("companyId") || "";
        payload.createdBy = Number(companyId);
        payload.createdType = "Super Admin";

        const response = await Post("master/subgroup/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Sub group created successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create sub group.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the sub group.");
    }
  };

  const handleDeleteOne = async (row: SubGroup) => {
    try {
      const response = await Delete(
        "master/subgroup/delete",
        { subGroupId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Sub group deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete sub group.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the sub group.");
    }
  };

  const handleDeleteMany = async (rows: { original: SubGroup }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/subgroup/delete",
            { subGroupId: Number(r.original.id) },
            false,
          ),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected sub groups deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting sub groups.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: SubGroup) => {
        setEditing(row);
        setDrawerOpen(true);
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
    <Page title="Sub Group">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Sub Group"
          createLabel="Create Sub Group"
          searchPlaceholder="Search sub groups..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptySubGroup());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "sub-groups")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Sub Group List",
              "sub-groups",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Sub Group Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
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
              ? "Loading sub groups..."
              : "No sub groups found. Click Create Sub Group to add one."
          }
        />
      </div>

      <SubGroupDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        subGroup={editing}
        onSave={handleSave}
      />
    </Page>
  );
}