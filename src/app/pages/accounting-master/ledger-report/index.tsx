import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { getLedgerColumns, ledgerExportColumns } from "./columns";
import { LedgerAccountRow, LedgerReportType } from "../shared/types";
import { LedgerReportModal } from "./LedgerReportModal";

const TYPE_TABS: { value: LedgerReportType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ledger", label: "Ledger" },
  { value: "default", label: "Default" },
];

export default function LedgerReportPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<LedgerAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupOptions, setGroupOptions] = useState<{ id: string; label: string }[]>([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [reportType, setReportType] = useState<LedgerReportType>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [filterAccountName, setFilterAccountName] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterState, setFilterState] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccountRow | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get(
        "ledger-report/list",
        { type: reportType, search: "" },
        false
      );
      if (response?.data?.success) {
        const list = (response.data.data || []) as LedgerAccountRow[];
        setData(list);

        const uniqueGroups = Array.from(
          new Map(
            list
              .filter((item) => item.groupName)
              .map((item) => [item.groupName as string, { id: item.groupName as string, label: item.groupName as string }]),
          ).values(),
        );
        setGroupOptions(uniqueGroups);
      } else {
        toasterrormsg(response?.data?.message || "Failed to fetch ledger report.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching ledger report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterAccountName &&
        !item.accountName?.toLowerCase().includes(filterAccountName.toLowerCase())
      )
        return false;
      if (filterGroup && item.groupName !== filterGroup) return false;
      if (filterState && item.stateName !== filterState) return false;
      return true;
    });
  }, [data, filterAccountName, filterGroup, filterState]);

  const stateOptions = useMemo(() => {
    return Array.from(
      new Map(
        data
          .filter((item) => item.stateName)
          .map((item) => [item.stateName as string, { id: item.stateName as string, label: item.stateName as string }]),
      ).values(),
    );
  }, [data]);

  const handleView = (row: LedgerAccountRow) => {
    setSelectedAccount(row);
    setModalOpen(true);
  };

  const columns = useMemo(() => getLedgerColumns(handleView), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    getRowId: (row) => String(row.id),
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleModalConfirm = (values: { fromDate: string; toDate: string; displayType: string }) => {
    if (!selectedAccount) return;
    setModalOpen(false);
    navigate(
      `/accounting-master/ledger-report/details/${selectedAccount.id}?fromDate=${values.fromDate}&toDate=${values.toDate}&displayType=${values.displayType}`
    );
  };

  return (
    <Page title="Ledger Report">
      <div className="transition-content w-full pb-5">

        <MasterToolbar
          title="Ledger Report"
          searchPlaceholder="Account Name"
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(
              filteredData,
              ledgerExportColumns,
              "ledger_report"
            )
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              ledgerExportColumns,
              "Ledger Report",
              "ledger_report"
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Account Name"
                value={filterAccountName}
                onChange={(e) => setFilterAccountName(e.target.value)}
                placeholder="Filter by account name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...groupOptions]}
                value={
                  [{ id: "", label: "All" }, ...groupOptions].find(
                    (item) => item.id === filterGroup,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterGroup(item.id)}
                label="Group"
                placeholder="All groups"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...stateOptions]}
                value={
                  [{ id: "", label: "All" }, ...stateOptions].find(
                    (item) => item.id === filterState,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterState(item.id)}
                label="State"
                placeholder="All states"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading ledger report..." : "No accounts found."}
        />
      </div>

      <LedgerReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </Page>
  );
}