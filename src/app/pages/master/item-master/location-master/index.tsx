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
import { LocationDrawer } from "./LocationDrawer";
import { columns, exportColumns } from "./columns";
import { emptyLocation, mapApiLocationToLocation, Location } from "./data";

export default function LocationPage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch locations ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/location/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiLocationToLocation));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching location data.");
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
        filterCode &&
        !item.locationCode.toLowerCase().includes(filterCode.toLowerCase())
      ) {
        return false;
      }

      if (
        filterName &&
        !item.locationName.toLowerCase().includes(filterName.toLowerCase())
      ) {
        return false;
      }

      if (filterStatus && item.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [data, filterCode, filterName, filterStatus]);

  // ---- Save (create or update) ----
  const handleSave = async (item: Location) => {
    const payload = {
      locationCode: item.locationCode,
      locationName: item.locationName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/location/update",
          { locationId: Number(item.id), ...payload },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Location updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update location.");
        }
      } else {
        const response = await Post("master/location/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Location created successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create location.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the location.");
    }
  };

  const handleDeleteOne = async (row: Location) => {
    try {
      const response = await Delete(
        "master/location/delete",
        { locationId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Location deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete location.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the location.");
    }
  };

  const handleDeleteMany = async (rows: { original: Location }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/location/delete",
            { locationId: Number(r.original.id) },
            false,
          ),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected locations deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting locations.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Location) => {
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
    <Page title="Location">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Location"
          createLabel="Create Location"
          searchPlaceholder="Search locations..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyLocation());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "locations")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Location List",
              "locations",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Location Code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Filter by code"
              />
              <Input
                label="Location Name"
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
              ? "Loading locations..."
              : "No locations found. Click Create Location to add one."
          }
        />
      </div>

      <LocationDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        location={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
