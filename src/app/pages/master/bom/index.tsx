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
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { statusOptions } from "../shared/constants";
import { columns, exportColumns } from "./columns";
import { emptyBOM2, mapApiBOM2ToBOM2, BOM2 } from "./data";

export default function BOM2Page() {
  const navigate = useNavigate();
  const [data, setData] = useState<BOM2[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterItemName, setFilterItemName] = useState("");
  const [filterBOMName, setFilterBOMName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch BOM2 items ----
  const fetchAll = async () => {
  setLoading(true);
  try {
    // 👇 FIX: was "master/bom2/list" — no such route exists.
    // Your router mounts everything under /master/bom (see bom.routes.js).
    const response = await Get("master/bom/list", {}, false);
    if (response.data?.success) {
      setData((response.data.data || []).map(mapApiBOM2ToBOM2));
    } else {
      toasterrormsg(response.data?.message || "Failed to fetch BOM items.");
    }
  } catch (error) {
    toasterrormsg("Something went wrong while fetching BOM2 data.");
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
        filterItemName &&
        !item.itemName.toLowerCase().includes(filterItemName.toLowerCase())
      )
        return false;
      if (
        filterBOMName &&
        !item.bomName.toLowerCase().includes(filterBOMName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterItemName, filterBOMName, filterStatus]);


  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      viewRow: (row: BOM2) => navigate(`/master/bom/view/${row.bomId}`),

      openEditDrawer: (row: BOM2) => navigate(`/master/bom/edit/${row.bomId}`),
      
      deleteRow: (row) => {
        // TODO: Implement delete functionality
        console.log("Delete row:", row.original);
      },
      deleteRows: (rows) => {
        // TODO: Implement bulk delete functionality
        console.log("Delete rows:", rows);
      },
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
    <Page title="BOM">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="BOM"
          createLabel="Create BOM"
          searchPlaceholder="Search BOM items..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/master/bom/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "bom2")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "BOM2 List",
              "bom2",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Item Name"
                value={filterItemName}
                onChange={(e) => setFilterItemName(e.target.value)}
                placeholder="Filter by item name"
              />
              <Input
                label="BOM Name"
                value={filterBOMName}
                onChange={(e) => setFilterBOMName(e.target.value)}
                placeholder="Filter by BOM name"
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
              ? "Loading BOM2 items..."
              : "No BOM items found. Click Create BOM2 to add one."
          }
        />
      </div>
    </Page>
  );
}
