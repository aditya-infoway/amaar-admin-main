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
import { AxleBrandDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyAxleBrand, mapApiAxleBrandToAxleBrand, AxleBrand } from "./data";

export default function AxleBrandPage() {
  const [data, setData] = useState<AxleBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AxleBrand | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch axle brands ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/axlebrand/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiAxleBrandToAxleBrand));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch axle brands.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching axle brand data.");
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
        !item.axleBrandName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: AxleBrand) => {
    const payload = {
      axleBrandName: item.axleBrandName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/axlebrand/update",
          { axleBrandId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Axle brand updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update axle brand.");
        }
      } else {
        const response = await Post("master/axlebrand/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Axle brand created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create axle brand.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the axle brand.");
    }
  };

  const handleDeleteOne = async (row: AxleBrand) => {
    try {
      const response = await Delete(
        "master/axlebrand/delete",
        { axleBrandId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Axle brand deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete axle brand.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the axle brand.");
    }
  };

  const handleDeleteMany = async (rows: { original: AxleBrand }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/axlebrand/delete",
            { axleBrandId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected axle brands deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting axle brands.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: AxleBrand) => {
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
    <Page title="Axle Brand">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Axle Brand"
          createLabel="Create Axle Brand"
          searchPlaceholder="Search axle brands..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyAxleBrand());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "axle-brands")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Axle Brand List",
              "axle-brands",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Axle Brand Name"
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
              ? "Loading axle brands..."
              : "No axle brands found. Click Create Axle Brand to add one."
          }
        />
      </div>

      <AxleBrandDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        axleBrand={editing}
        onSave={handleSave}
      />
    </Page>
  );
}