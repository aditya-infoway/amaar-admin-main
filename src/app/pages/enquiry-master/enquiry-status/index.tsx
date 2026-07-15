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
import { EnquiryStatusDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyEnquiryStatus, mapApiEnquiryStatusToEnquiryStatus, EnquiryStatus } from "./data";

export default function EnquiryStatusPage() {
  const [data, setData] = useState<EnquiryStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EnquiryStatus | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch enquiry statuses ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/enquirystatus/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiEnquiryStatusToEnquiryStatus));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch enquiry statuses.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching enquiry status data.");
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
        !item.statusName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: EnquiryStatus) => {
    const payload = {
      statusName: item.statusName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/enquirystatus/update",
          { enquiryStatusId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry status updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update enquiry status.");
        }
      } else {
        const response = await Post("master/enquirystatus/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Enquiry status created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create enquiry status.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the enquiry status.");
    }
  };

  const handleDeleteOne = async (row: EnquiryStatus) => {
    try {
      const response = await Delete(
        "master/enquirystatus/delete",
        { enquiryStatusId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Enquiry status deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete enquiry status.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the enquiry status.");
    }
  };

  const handleDeleteMany = async (rows: { original: EnquiryStatus }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/enquirystatus/delete",
            { enquiryStatusId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected enquiry statuses deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting enquiry statuses.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: EnquiryStatus) => {
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
    <Page title="Enquiry Status">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Status"
          createLabel="Create Enquiry Status"
          searchPlaceholder="Search enquiry statuses..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEnquiryStatus());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "enquiry-statuses")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Enquiry Status List",
              "enquiry-statuses",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Enquiry Status Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by status name"
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
              ? "Loading enquiry statuses..."
              : "No enquiry statuses found. Click Create Enquiry Status to add one."
          }
        />
      </div>

      <EnquiryStatusDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquiryStatus={editing}
        onSave={handleSave}
      />
    </Page>
  );
}