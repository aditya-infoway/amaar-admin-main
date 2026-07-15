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
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { EnquirySourceDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyEnquirySource, mapApiEnquirySourceToEnquirySource, EnquirySource } from "./data";

export default function EnquirySourcePage() {
  const [data, setData] = useState<EnquirySource[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EnquirySource | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch enquiry sources ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/enquirysource/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiEnquirySourceToEnquirySource));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch enquiry sources.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching enquiry source data.");
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
        !item.sourceName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: EnquirySource) => {
    const payload = {
      sourceName: item.sourceName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/enquirysource/update",
          { enquirySourceId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry source updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update enquiry source.");
        }
      } else {
        const response = await Post("master/enquirysource/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry source created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create enquiry source.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the enquiry source.");
    }
  };

  const handleDeleteOne = async (row: EnquirySource) => {
    try {
      const response = await Delete(
        "master/enquirysource/delete",
        { enquirySourceId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Enquiry source deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete enquiry source.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the enquiry source.");
    }
  };

  const handleDeleteMany = async (rows: { original: EnquirySource }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/enquirysource/delete",
            { enquirySourceId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected enquiry sources deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting enquiry sources.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: EnquirySource) => {
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
    <Page title="Enquiry Source">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Source"
          createLabel="Create Enquiry Source"
          searchPlaceholder="Search enquiry sources..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEnquirySource());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "enquiry-sources")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Enquiry Source List",
              "enquiry-sources",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Source"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by source"
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
              ? "Loading enquiry sources..."
              : "No enquiry sources found. Click Create Enquiry Source to add one."
          }
        />
      </div>

      <EnquirySourceDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquirySource={editing}
        onSave={handleSave}
      />
    </Page>
  );
}