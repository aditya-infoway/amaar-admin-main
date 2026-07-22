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
import { EmployeeDrawer } from "./CategoryDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyEmployee, Employee, mapApiEmployeeToEmployee } from "./data";
import { departmentOptions, getBranchLabel, getDepartmentLabel } from "./options";

interface RoleOption {
  id: string;
  label: string;
  department: string;
}

export default function EmployeePage() {
  const [data, setData] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // ---- Fetch roles and employees ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roleRes, employeeRes] = await Promise.all([
        Get("master/role/list", {}, false),
        Get("master/employee/list", {}, false),
      ]);

      if (roleRes.data?.success) {
        setRoles(
          (roleRes.data.data || []).map((item: any) => ({
            id: String(item.roleId),
            label: item.roleName,
            department: item.department,
          }))
        );
      }

      if (employeeRes.data?.success) {
        setData((employeeRes.data.data || []).map(mapApiEmployeeToEmployee));
      } else {
        toasterrormsg(employeeRes.data?.message || "Failed to fetch employees.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching employee data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleName = (id: string) =>
    roles.find((item) => item.id === id)?.label || "";

  const columns = useMemo(
    () => createColumns(getRoleName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles.length],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.employeeName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterDepartment && item.department !== filterDepartment) return false;
      return true;
    });
  }, [data, filterName, filterDepartment]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    departmentName: getDepartmentLabel(row.department),
    branchName: getBranchLabel(row.branch),
    roleName: getRoleName(row.roleId),
  }));

  // ---- Save (create or update) via API ----
  const handleSave = async (item: Employee) => {
    const payload: any = {
      department: item.department,
      branch: item.branch,
      roleId: Number(item.roleId),
      employeeName: item.employeeName,
      mobileNumber: item.mobileNumber,
      alternateNumber: item.alternateNumber,
      email: item.email,
    };

    try {
      if (item.id) {
        if (item.password) payload.password = item.password;

        const response = await Put(
          "master/employee/update",
          { employeeId: Number(item.id), ...payload },
          false
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Employee updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update employee.");
        }
      } else {
        payload.password = item.password;
        const response = await Post("master/employee/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Employee created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create employee.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the employee.");
    }
  };

  const handleDeleteOne = async (row: Employee) => {
    try {
      const response = await Delete(
        "master/employee/delete",
        { employeeId: Number(row.id) },
        false
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Employee deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete employee.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the employee.");
    }
  };

  const handleDeleteMany = async (rows: { original: Employee }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("master/employee/delete", { employeeId: Number(r.original.id) }, false)
        )
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected employees deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting employees.");
    }
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
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "employees")}
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Employee List", "employees")
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
                label="Department"
                placeholder="All departments"
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
              ? "Loading employees..."
              : "No employees found. Click Add Employee to add one."
          }
        />
      </div>

      <EmployeeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        employee={editing}
        roles={roles}
        onSave={handleSave}
      />
    </Page>
  );
}