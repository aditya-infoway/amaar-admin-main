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

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { masterStorage } from "../shared/storage";
import { EmployeeDrawer } from "./CategoryDrawer";
import { columns, exportColumns } from "./columns";
import { Employee, emptyEmployee } from "./data";
import { departmentOptions } from "./options";

export default function EmployeePage() {
  const [data, setData] = useState<Employee[]>(() =>
    masterStorage.getEmployees(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.employeeName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterDepartment && item.typeOfDepartment !== filterDepartment)
        return false;
      return true;
    });
  }, [data, filterName, filterDepartment]);

  const persist = (next: Employee[]) => {
    setData(next);
    masterStorage.saveEmployees(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Employee) => {
        setEditing(row);
        setDrawerOpen(true);
      },
      deleteRow: (row) => {
        persist(data.filter((item) => item.id !== row.original.id));
      },
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
    <Page title="Create Employee">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Create Employee"
          createLabel="Add Employee"
          searchPlaceholder="Search employees..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyEmployee());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "employees")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Employee List",
              "employees",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Employee Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by employee name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...departmentOptions]}
                value={
                  [{ id: "", label: "All" }, ...departmentOptions].find(
                    (item) => item.id === filterDepartment,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterDepartment(item.id)}
                label="Type of Department"
                placeholder="All departments"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No employees found. Click Add Employee to add one."
        />
      </div>

      <EmployeeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        employee={editing}
        onSave={(item) => {
          const exists = data.some((row) => row.id === item.id);
          persist(
            exists
              ? data.map((row) => (row.id === item.id ? item : row))
              : [item, ...data],
          );
        }}
      />
    </Page>
  );
}