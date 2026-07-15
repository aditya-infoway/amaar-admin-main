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
import { HydraulicBrandDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyHydraulicBrand, mapApiHydraulicBrandToHydraulicBrand, HydraulicBrand } from "./data";

export default function HydraulicBrandPage() {
  const [data, setData] = useState<HydraulicBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<HydraulicBrand | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch hydraulic brands ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/hydraulicbrand/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiHydraulicBrandToHydraulicBrand));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch hydraulic brands.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching hydraulic brand data.");
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
        !item.hydraulicBrandName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: HydraulicBrand) => {
    const payload = {
      hydraulicBrandName: item.hydraulicBrandName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/hydraulicbrand/update",
          { hydraulicBrandId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Hydraulic brand updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update hydraulic brand.");
        }
      } else {
        const response = await Post("master/hydraulicbrand/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Hydraulic brand created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create hydraulic brand.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the hydraulic brand.");
    }
  };

  const handleDeleteOne = async (row: HydraulicBrand) => {
    try {
      const response = await Delete(
        "master/hydraulicbrand/delete",
        { hydraulicBrandId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Hydraulic brand deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete hydraulic brand.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the hydraulic brand.");
    }
  };

  const handleDeleteMany = async (rows: { original: HydraulicBrand }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/hydraulicbrand/delete",
            { hydraulicBrandId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected hydraulic brands deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting hydraulic brands.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: HydraulicBrand) => {
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
    <Page title="Hydraulic Brand">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Hydraulic Brand"
          createLabel="Create Hydraulic Brand"
          searchPlaceholder="Search hydraulic brands..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyHydraulicBrand());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "hydraulic-brands")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Hydraulic Brand List",
              "hydraulic-brands",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Hydraulic Brand Name"
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
              ? "Loading hydraulic brands..."
              : "No hydraulic brands found. Click Create Hydraulic Brand to add one."
          }
        />
      </div>

      <HydraulicBrandDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        hydraulicBrand={editing}
        onSave={handleSave}
      />
    </Page>
  );
}