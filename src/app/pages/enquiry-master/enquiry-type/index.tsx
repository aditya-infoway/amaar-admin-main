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
import { EnquiryTypeDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyEnquiryType, mapApiEnquiryTypeToEnquiryType, EnquiryType } from "./data";

export default function EnquiryTypePage() {
  const [data, setData] = useState<EnquiryType[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EnquiryType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch enquiry types ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/enquirytype/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiEnquiryTypeToEnquiryType));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch enquiry types.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching enquiry type data.");
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
        !item.enquiryTypeName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: EnquiryType) => {
    const payload = {
      enquiryTypeName: item.enquiryTypeName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/enquirytype/update",
          { enquiryTypeId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry type updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update enquiry type.");
        }
      } else {
        const response = await Post("master/enquirytype/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry type created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create enquiry type.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the enquiry type.");
    }
  };

  const handleDeleteOne = async (row: EnquiryType) => {
    try {
      const response = await Delete(
        "master/enquirytype/delete",
        { enquiryTypeId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Enquiry type deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete enquiry type.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the enquiry type.");
    }
  };

  const handleDeleteMany = async (rows: { original: EnquiryType }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/enquirytype/delete",
            { enquiryTypeId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected enquiry types deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting enquiry types.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: EnquiryType) => {
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
    <Page title="Enquiry Type">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Type"
          createLabel="Create Enquiry Type"
          searchPlaceholder="Search enquiry types..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEnquiryType());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "enquiry-types")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Enquiry Type List",
              "enquiry-types",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Enquiry Type Name"
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
              ? "Loading enquiry types..."
              : "No enquiry types found. Click Create Enquiry Type to add one."
          }
        />
      </div>

      <EnquiryTypeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquiryType={editing}
        onSave={handleSave}
      />
    </Page>
  );
}