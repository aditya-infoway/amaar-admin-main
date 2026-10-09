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
import { Get, toasterrormsg } from "@/ApiHelper";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { SalesRegister } from "./data";
import { SalesDetailsDrawer } from "./SalesDetailsDrawer";

export default function SalesRegisterPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SalesRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterParty, setFilterParty] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Details drawer state ----
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSalesId, setSelectedSalesId] = useState<string | null>(null);

  const fetchSalesList = async () => {
    try {
      setLoading(true);
      const financialYearId = localStorage.getItem("financialYearId");
      const res = await Get("sales/list", { financialYearId }, false);
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load sales register list.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Failed to load sales register list.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesList();
  }, []);

  const locationOptions = useMemo(
    () =>
      [...new Set(data.map((item) => item.location))]
        .filter(Boolean)
        .map((name) => ({ id: name, label: name })),
    [data],
  );

  const statusOptions = useMemo(
    () =>
      [...new Set(data.map((item) => item.status))]
        .filter(Boolean)
        .map((name) => ({ id: name, label: name })),
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterParty &&
        !(item.partyName || "").toLowerCase().includes(filterParty.toLowerCase())
      )
        return false;
      if (filterLocation && item.location !== filterLocation) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterParty, filterLocation, filterStatus]);

  const removeLocally = (ids: Set<string>) => {
    setData((prev) => prev.filter((item) => !ids.has(item.id)));
  };

  const handleViewRow = (row: SalesRegister) => {
    setSelectedSalesId(row.id);
    setDetailsOpen(true);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: SalesRegister) =>
        navigate(`/purchase-master/sales-register/edit/${row.id}`),
      viewRow: handleViewRow,
      deleteRow: (row) => removeLocally(new Set([row.original.id])),
      deleteRows: (rows) => {
        const ids = new Set(rows.map((r) => r.original.id));
        removeLocally(ids);
        setRowSelection({});
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
    <Page title="Sales Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Sales Register"
          createLabel="Create Sales Register"
          searchPlaceholder="Search sales registers..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/purchase-master/sales-register/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "sales-registers")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Sales Register List",
              "sales-registers",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Party Name"
                value={filterParty}
                onChange={(e) => setFilterParty(e.target.value)}
                placeholder="Filter by party name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...locationOptions]}
                value={
                  [{ id: "", label: "All" }, ...locationOptions].find(
                    (item) => item.id === filterLocation,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterLocation(item.id)}
                label="Location"
                placeholder="All locations"
                displayField="label"
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
              ? "Loading sales registers..."
              : "No sales registers found. Click Create Sales Register to add one."
          }
        />
      </div>

      <SalesDetailsDrawer
        open={detailsOpen}
        salesId={selectedSalesId}
        onClose={() => setDetailsOpen(false)}
      />
    </Page>
  );
}