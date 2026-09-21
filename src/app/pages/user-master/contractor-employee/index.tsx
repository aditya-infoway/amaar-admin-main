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
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Delete,
  Get,
  Post,
  Put,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { ContractorEmployeeDrawer } from "./Contractoremployeedrawer";
import { createColumns, createExportColumns } from "./columns";
import { emptyContractorEmployee } from "./data";
import type {
  ContractorEmployee,
  ContractorEmployeeFiles,
  ContractorEmployeeInput,
} from "./types";
export default function ContractorEmployeePage() {
  const [data, setData] = useState<ContractorEmployee[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ContractorEmployee | null>(null);
  const [viewOnly, setViewOnly] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filterParty, setFilterParty] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterParty &&
        !item.partyName.toLowerCase().includes(filterParty.toLowerCase())
      ) {
        return false;
      }

      if (
        filterEmployee &&
        !item.employeeName.toLowerCase().includes(filterEmployee.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [data, filterParty, filterEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await Get("contractoremployee/list", {}, false);

      if (response?.data?.success || response?.data?.status === 200) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error("Contractor employee list error:", error);
      toasterrormsg("Unable to load employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const columns = useMemo(() => createColumns(), []);
  const exportColumns = useMemo(() => createExportColumns(), []);

  const openDrawer = (row: ContractorEmployee | null, view = false) => {
    setEditing(row);
    setViewOnly(view);
    setDrawerOpen(true);
  };

  const handleSave = async (
    values: ContractorEmployeeInput,
    files: ContractorEmployeeFiles,
  ) => {
    const formData = new FormData();
    formData.append("partyId", values.partyId);
    formData.append("employeeName", values.employeeName);
    formData.append("employeeNo", values.employeeNo);
    formData.append("email", values.email);
    formData.append("address", values.address);
    formData.append("aadharNumber", values.aadharNumber);
    formData.append("panNumber", values.panNumber);
    if (files.aadhar) formData.append("aadharImage", files.aadhar);
    if (files.pan) formData.append("panImage", files.pan);

    try {
      const response = editing?.id
        ? await Put(`contractoremployee/${editing.id}`, formData, true)
        : await Post("contractoremployee/create", formData, true);

      const responseData = response?.data;

      if (responseData?.success || responseData?.status === 200) {
        toastsuccessmsg(
          responseData?.message ||
            (editing?.id ? "Employee updated" : "Employee saved"),
        );
        await fetchEmployees();
        setDrawerOpen(false);
      } else {
        toasterrormsg(responseData?.message || "Failed to save employee.");
      }
    } catch (error: any) {
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving employee.",
      );
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,

    state: { globalFilter, sorting, rowSelection },

    enableRowSelection: true,
    getRowId: (row) => String(row.id),

    meta: {
      viewRow: (row: ContractorEmployee) => openDrawer(row, true),

      openEditDrawer: (row: ContractorEmployee) => openDrawer(row),

      deleteRow: async (row: any) => {
        try {
          const response = await Delete(
            `contractoremployee/${row.original.id}`,
            {},
            false,
          );

          if (response?.data?.success || response?.data?.status === 200) {
            setData((prev) =>
              prev.filter(
                (item) => String(item.id) !== String(row.original.id),
              ),
            );
            toastsuccessmsg(
              response?.data?.message || "Employee deleted successfully",
            );
          } else {
            toasterrormsg(
              response?.data?.message || "Failed to delete employee.",
            );
          }
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting employee.",
          );
        }
      },

      deleteRows: async (rows: any[]) => {
        try {
          const ids = rows.map((row) => row.original.id);

          await Promise.all(
            ids.map((id) => Delete(`contractoremployee/${id}`, {}, false)),
          );

          const idSet = new Set(ids.map((id) => String(id)));
          setData((prev) => prev.filter((item) => !idSet.has(String(item.id))));
          setRowSelection({});
          toastsuccessmsg("Selected employees deleted successfully");
        } catch (error: any) {
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting employees.",
          );
        }
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
    <Page title="Contractor Employee Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Contractor Employee Register"
          createLabel="Add Employee"
          searchPlaceholder="Search employees..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => openDrawer(emptyContractorEmployee())}
          onExportExcel={() =>
            exportToExcel(
              filteredData,
              exportColumns,
              "contractor_employee_register",
            )
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Contractor Employee Register",
              "contractor_employee_register",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Party"
                value={filterParty}
                onChange={(e) => setFilterParty(e.target.value)}
                placeholder="Filter by party"
              />

              <Input
                label="Employee Name"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                placeholder="Filter by employee name"
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

      <ContractorEmployeeDrawer
        isOpen={drawerOpen}
        readOnly={viewOnly}
        close={() => setDrawerOpen(false)}
        employee={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
