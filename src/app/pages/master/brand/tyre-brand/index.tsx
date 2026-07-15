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
import { TyreBrandDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyTyreBrand, mapApiTyreBrandToTyreBrand, TyreBrand } from "./data";

export default function TyreBrandPage() {
  const [data, setData] = useState<TyreBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TyreBrand | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch tyre brands ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/tyrebrand/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiTyreBrandToTyreBrand));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch tyre brands.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching tyre brand data.");
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
        !item.tyreBrandName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: TyreBrand) => {
    const payload = {
      tyreBrandName: item.tyreBrandName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/tyrebrand/update",
          { tyreBrandId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Tyre brand updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update tyre brand.");
        }
      } else {
        const response = await Post("master/tyrebrand/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Tyre brand created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create tyre brand.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the tyre brand.");
    }
  };

  const handleDeleteOne = async (row: TyreBrand) => {
    try {
      const response = await Delete(
        "master/tyrebrand/delete",
        { tyreBrandId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Tyre brand deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete tyre brand.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the tyre brand.");
    }
  };

  const handleDeleteMany = async (rows: { original: TyreBrand }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/tyrebrand/delete",
            { tyreBrandId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected tyre brands deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting tyre brands.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: TyreBrand) => {
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
    <Page title="Tyre Brand">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Tyre Brand"
          createLabel="Create Tyre Brand"
          searchPlaceholder="Search tyre brands..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyTyreBrand());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "tyre-brands")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Tyre Brand List",
              "tyre-brands",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Tyre Brand Name"
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
              ? "Loading tyre brands..."
              : "No tyre brands found. Click Create Tyre Brand to add one."
          }
        />
      </div>

      <TyreBrandDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        tyreBrand={editing}
        onSave={handleSave}
      />
    </Page>
  );
}