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
import { ProfessionDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { emptyProfession, mapApiProfessionToProfession, Profession } from "./data";

export default function ProfessionPage() {
  const [data, setData] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Profession | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch professions ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("master/profession/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiProfessionToProfession));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch professions.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching profession data.");
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
        !item.professionName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  // ---- Save (create or update) via API ----
  const handleSave = async (item: Profession) => {
    const payload = {
      professionName: item.professionName,
      status: item.status,
    };

    try {
      if (item.id) {
        const response = await Put(
          "master/profession/update",
          { professionId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Profession updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update profession.");
        }
      } else {
        const response = await Post("master/profession/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Profession created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create profession.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the profession.");
    }
  };

  const handleDeleteOne = async (row: Profession) => {
    try {
      const response = await Delete(
        "master/profession/delete",
        { professionId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Profession deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete profession.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the profession.");
    }
  };

  const handleDeleteMany = async (rows: { original: Profession }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/profession/delete",
            { professionId: Number(r.original.id) },
            false
          )
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected professions deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting professions.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Profession) => {
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
    <Page title="Profession">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Profession"
          createLabel="Create Profession"
          searchPlaceholder="Search professions..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyProfession());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "professions")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Profession List",
              "professions",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Profession"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by profession"
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
              ? "Loading professions..."
              : "No professions found. Click Create Profession to add one."
          }
        />
      </div>

      <ProfessionDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        profession={editing}
        onSave={handleSave}
      />
    </Page>
  );
}