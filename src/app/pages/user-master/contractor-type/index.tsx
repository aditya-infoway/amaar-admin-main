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
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Put, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns, getDepartmentLabel } from "./columns";
import { ContractorEmployee, mapApiToContractorEmployee } from "./data";
import { ContractorTypeDrawer } from "./ContractorTypeDrawer";

// 👇 adjust to your actual backend routes
const API = {
  list: "master/contractor-type/list",
  update: "master/contractor-type/update",
  delete: "master/employee/delete",
};

export default function ContractorTypePage() {
  const [data, setData] = useState<ContractorEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ContractorEmployee | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await Get(API.list, {}, false);
      if (res.data?.success) {
        setData((res.data.data || []).map(mapApiToContractorEmployee));
      } else {
        toasterrormsg(
          res.data?.message || "Failed to fetch contractor managers.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (item: ContractorEmployee) => {
    try {
      const res = await Put(
        API.update,
        { employeeId: Number(item.id), contractorTypes: item.contractorTypes },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg(
          res.data?.message || "Contractor type updated successfully.",
        );
        fetchAll();
      } else {
        toasterrormsg(res.data?.message || "Failed to update contractor type.");
      }
    } catch {
      toasterrormsg("Something went wrong while updating.");
    }
  };

  const handleDeleteOne = async (row: ContractorEmployee) => {
    try {
      const res = await Delete(
        API.delete,
        { employeeId: Number(row.id) },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Deleted successfully.");
        setData((prev) => prev.filter((i) => i.id !== row.id));
      } else {
        toasterrormsg(res.data?.message || "Failed to delete.");
      }
    } catch {
      toasterrormsg("Something went wrong while deleting.");
    }
  };

  const handleDeleteMany = async (rows: { original: ContractorEmployee }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(API.delete, { employeeId: Number(r.original.id) }, false),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((i) => !ids.has(i.id)));
      setRowSelection({});
      toastsuccessmsg("Selected records deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting.");
    }
  };

  const exportRows = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        departmentName: getDepartmentLabel(row.department),
        createdDate: row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-GB")
          : "",
        contractorType: row.contractorTypes.join(", "),
      })),
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ContractorEmployee) => {
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
    <Page title="Contractor Type">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Contractor Type"
          searchPlaceholder="Search contractor managers..."
          table={table}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "contractor-types")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Contractor Type List",
              "contractor-types",
            )
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading..." : "No contractor managers found."
          }
        />
      </div>

      <ContractorTypeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        employee={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
