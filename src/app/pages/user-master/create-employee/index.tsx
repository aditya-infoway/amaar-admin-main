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
import {
  Get,
  Post,
  Put,
  Delete,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { EmployeeDrawer } from "./CategoryDrawer";
import { createColumns, exportColumns } from "./columns";
import { emptyEmployee, Employee, mapApiEmployeeToEmployee } from "./data";
import {
  departmentOptions,
  getBranchLabel,
  getDepartmentLabel,
} from "./options";

interface RoleOption {
  id: string;
  label: string;
  department: string;
}

// Production employees ke liye table me role ki jagah process ka naam dikhane ke liye
const PROCESS_PREFIX = "p-";

const isProductionDept = (department: string) =>
  String(department || "").toLowerCase() === "production";

export default function EmployeePage() {
  const [data, setData] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [processMap, setProcessMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // ---- Fetch roles, employees and process names ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const financialYearId = localStorage.getItem("financialYearId");

      const [roleRes, employeeRes, processRes] = await Promise.all([
        Get("master/role/list", {}, false),
        Get("master/employee/list", {}, false),
        Get(
          "main-process/list",
          financialYearId ? { financialYearId } : {},
          false,
        ).catch(() => null),
      ]);

      if (roleRes.data?.success) {
        setRoles(
          (roleRes.data.data || []).map((item: any) => ({
            id: String(item.roleId),
            label: item.roleName,
            department: item.department,
          })),
        );
      }

      if (processRes?.data?.success) {
        const map: Record<string, string> = {};
        (processRes.data.data || []).forEach((m: any) =>
          (m.processes || []).forEach((p: any) => {
            map[String(p.id)] = p.processName;
          }),
        );
        setProcessMap(map);
      }

      if (employeeRes.data?.success) {
        setData((employeeRes.data.data || []).map(mapApiEmployeeToEmployee));
      } else {
        toasterrormsg(
          employeeRes.data?.message || "Failed to fetch employees.",
        );
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

  // roleId normal role ka id hota hai; "p-<processId>" aaye to process ka naam
  const getRoleName = (id: string) => {
    if (String(id).startsWith(PROCESS_PREFIX)) {
      return processMap[String(id).slice(PROCESS_PREFIX.length)] || "";
    }
    return roles.find((item) => item.id === id)?.label || "";
  };

  const columns = useMemo(
    () => createColumns(getRoleName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles.length, processMap],
  );

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        if (
          filterName &&
          !item.employeeName.toLowerCase().includes(filterName.toLowerCase())
        )
          return false;
        if (filterDepartment && item.department !== filterDepartment)
          return false;
        return true;
      })
      // table display ke liye: Production rows ka role = process
      .map((item) =>
        isProductionDept(item.department) && item.processId
          ? { ...item, roleId: `${PROCESS_PREFIX}${item.processId}` }
          : item,
      );
  }, [data, filterName, filterDepartment]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    departmentName: getDepartmentLabel(row.department),
    branchName: getBranchLabel(row.branch),
    roleName: getRoleName(row.roleId),
  }));

  // ---- Save (create or update) via API ----
  const handleSave = async (item: Employee) => {
    const isProduction = isProductionDept(item.department);

    const payload: any = {
      department: item.department,
      branch: item.branch,
      employeeName: item.employeeName,
      mobileNumber: item.mobileNumber,
      alternateNumber: item.alternateNumber,
      email: item.email,
      accountId: item.accountId ? Number(item.accountId) : null,
    };

    if (isProduction) {
      // Production me role nahi, process / sub process jaata hai
      payload.processId = item.processId ? Number(item.processId) : undefined;
      payload.subProcessId = item.subProcessId
        ? Number(item.subProcessId)
        : undefined;
    } else {
      payload.roleId = Number(item.roleId);
    }

    try {
      if (item.id) {
        if (item.password) payload.password = item.password;

        const response = await Put(
          "master/employee/update",
          { employeeId: Number(item.id), ...payload },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Employee updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update employee.");
        }
      } else {
        payload.password = item.password;

        // ===== companyId localStorage se, createdType default "Super Admin" =====
        const companyId = localStorage.getItem("companyId") || "";
        payload.createdBy = Number(companyId);
        payload.createdType = "Super Admin";

        const response = await Post("master/employee/create", payload, false);
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Employee created successfully.",
          );
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
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Employee deleted successfully.",
        );
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
          Delete(
            "master/employee/delete",
            { employeeId: Number(r.original.id) },
            false,
          ),
        ),
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
        // table row me roleId display ke liye badla hua hai, drawer ko original do
        setEditing(data.find((d) => d.id === row.id) || row);
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
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "employees")
          }
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