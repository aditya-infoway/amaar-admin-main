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
import { Get, Post, Put, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../shared/export";
import { MasterTable } from "../../shared/MasterTable";
import { MasterToolbar } from "../../shared/MasterToolbar";
import { statusOptions } from "../../shared/constants";
import { BodyTypeDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyBodyType, mapApiBodyTypeToBodyType, BodyType } from "./data";

export default function BodyTypePage() {
  const [data, setData] = useState<BodyType[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BodyType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch body types ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/bodytype/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiBodyTypeToBodyType));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch body types.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching body type data.");
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
        filterName &&
        !item.bodyTypeName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: BodyType) => {
    const payload = {
      bodyTypeName: item.bodyTypeName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/bodytype/update",
          { bodyTypeId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Body type updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update body type.");
        }
      } else {
        const response = await Post("master/bodytype/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Body type created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create body type.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the body type.");
    }
  };

  const handleDeleteOne = async (row: BodyType) => {
    try {
      const response = await Delete(
        "master/bodytype/delete",
        { bodyTypeId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Body type deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete body type.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the body type.");
    }
  };

  const handleDeleteMany = async (rows: { original: BodyType }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/bodytype/delete",
            { bodyTypeId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected body types deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting body types.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: BodyType) => {
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
    <Page title="Body Type">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Body Type"
          createLabel="Create Body Type"
          searchPlaceholder="Search body types..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyBodyType());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "body-types")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Body Type List",
              "body-types",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Body Type Name"
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
              ? "Loading body types..."
              : "No body types found. Click Create Body Type to add one."
          }
        />
      </div>

      <BodyTypeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        bodyType={editing}
        onSave={handleSave}
      />
    </Page>
  );
}