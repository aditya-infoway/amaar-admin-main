import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { PurchaseRegister } from "./data";
import { purchaseRegisterStorage } from "../shared/storage";

export default function PurchaseRegisterPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseRegister[]>(() =>
    purchaseRegisterStorage.getPurchaseRegisters(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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
        filterSupplier &&
        !item.supplierName.toLowerCase().includes(filterSupplier.toLowerCase())
      )
        return false;
      if (filterLocation && item.location !== filterLocation) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterSupplier, filterLocation, filterStatus]);

  const persist = (next: PurchaseRegister[]) => {
    setData(next);
    purchaseRegisterStorage.savePurchaseRegisters(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: PurchaseRegister) =>
        navigate(`/purchase-master/purchase-register/edit/${row.id}`),
      deleteRow: (row) =>
        persist(data.filter((item) => item.id !== row.original.id)),
      deleteRows: (rows) => {
        const ids = new Set(rows.map((r) => r.original.id));
        persist(data.filter((item) => !ids.has(item.id)));
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
    <Page title="Purchase Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Purchase Register"
          createLabel="Create Purchase Register"
          searchPlaceholder="Search purchase registers..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/purchase-master/purchase-register/create")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "purchase-registers")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Purchase Register List",
              "purchase-registers",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Supplier Name"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                placeholder="Filter by supplier name"
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
          emptyMessage="No purchase registers found. Click Create Purchase Register to add one."
        />
      </div>
    </Page>
  );
}