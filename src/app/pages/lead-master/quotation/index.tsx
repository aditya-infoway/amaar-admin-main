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
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { QuotationDrawer } from "./CategoryDrawer";
import {
  createColumns,
  createExportColumns,
  CreateMasterOption,
} from "./columns";
import { emptyQuotation } from "./data";
import { Quotation } from "../shared/types";
import { Get, Delete, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

export default function QuotationPage() {
  const [data, setData] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [createMasterOptions, setCreateMasterOptions] = useState<
    CreateMasterOption[]
  >([]);

  const fetchCreateMasterOptions = async () => {
    try {
      const response = await Get("master/createmaster/list", {}, false);

      if (response?.data?.success) {
        setCreateMasterOptions(response.data.data || []);
      }
    } catch (error) {
      console.error("Create Master list error:", error);
    }
  };

  useEffect(() => {
    fetchCreateMasterOptions();
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);

        const financialYearId = sessionStorage.getItem("financialYearId");

        const response = await Get(
          "quotation/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const quotations = response.data.data || [];

          setData(quotations);
        } else {
          console.error(
            "Quotation list failed:",
            response?.data?.message || response?.data,
          );
        }
      } catch (error) {
        console.error("Quotation list error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCustomer &&
        !item.customerName.toLowerCase().includes(filterCustomer.toLowerCase())
      )
        return false;
      if (
        filterCity &&
        !item.city.toLowerCase().includes(filterCity.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterCustomer, filterCity]);

  const quotationColumns = useMemo(
    () => createColumns(createMasterOptions),
    [createMasterOptions],
  );

  const quotationExportColumns = useMemo(
    () => createExportColumns(createMasterOptions),
    [createMasterOptions],
  );

  const persist = (next: Quotation[]) => {
    setData(next);
  };

  const table = useReactTable({
    data: filteredData,
    columns: quotationColumns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
     meta: {
      openEditDrawer: (row: Quotation) => {
        setEditing(row);
        setDrawerOpen(true);
      },
           deleteRow: async (row) => {
        try {
          const response = await Delete(`quotation/${row.original.id}`, {}, false);

          if (response?.data?.success || response?.data?.status === 200) {
            persist(data.filter((item) => item.id !== row.original.id));
            toastsuccessmsg(response?.data?.message || "Quotation deleted successfully");
          } else {
            toasterrormsg(response?.data?.message || "Failed to delete quotation.");
          }
        } catch (error: any) {
          console.error("Quotation delete error:", error);
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting quotation.",
          );
        }
      },
      deleteRows: async (rows) => {
        try {
          const ids = rows.map((r) => r.original.id);

          await Promise.all(ids.map((id) => Delete(`quotation/${id}`, {}, false)));

          const idSet = new Set(ids);
          persist(data.filter((item) => !idSet.has(item.id)));
          setRowSelection({});
          toastsuccessmsg("Selected quotations deleted successfully");
        } catch (error: any) {
          console.error("Quotation bulk delete error:", error);
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong while deleting quotations.",
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
    <Page title="Quotation">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Quotation"
          createLabel="Add Quotation"
          searchPlaceholder="Search quotations..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyQuotation());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, quotationExportColumns, "quotations")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              quotationExportColumns,
              "Quotation List",
              "quotations",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Customer Name"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                placeholder="Filter by customer name"
              />
              <Input
                label="City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Filter by city"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={quotationColumns.length}
          emptyMessage="No quotations found. Click Add Quotation to add one."
        />
      </div>

      <QuotationDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        quotation={editing}
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
