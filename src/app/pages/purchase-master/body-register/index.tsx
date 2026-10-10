// src/pages/body-register/index.tsx
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
import { Tab, TabGroup, TabList } from "@headlessui/react";
import clsx from "clsx";
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

import { columns, exportColumns } from "./columns";
import { mapApiWorkOrderToWorkOrder, TabKey, WorkOrderRow } from "./data";
import { BodyRegisterDrawer } from "./Bodyregisterdrawer";
import { BodyRegisterViewDrawer } from "./BodyRegisterViewDrawer";

const TAB_INDEX: Record<TabKey, number> = { pending: 0, generate: 1 };
const INDEX_TAB: TabKey[] = ["pending", "generate"];

export default function BodyRegisterPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [data, setData] = useState<WorkOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<WorkOrderRow | null>(null);
  const [viewRow, setViewRow] = useState<WorkOrderRow | null>(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchAll = async (status: TabKey) => {
    setLoading(true);
    try {
      const res = await Get(`workorder/list`, {}, false);
      if (res.data?.success) {
        setData(
          (res.data.data || [])
            .map(mapApiWorkOrderToWorkOrder)
            .filter(
              (r: WorkOrderRow) =>
                r.bodyRegisterGenerated === (status === "generate"),
            ),
        );
      } else {
        toasterrormsg(res.data?.message || "Failed to fetch work orders.");
        setData([]);
      }
    } catch {
      toasterrormsg("Something went wrong while fetching work orders.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRowSelection({});
    fetchAll(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterCity &&
        !item.city.toLowerCase().includes(filterCity.toLowerCase())
      ) {
        return false;
      }
      if (filterType !== "all" && item.type !== filterType) return false;
      return true;
    });
  }, [data, filterCity, filterType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: false,
    getRowId: (row) => String(row.id),
    meta: {
      tab,
      openDrawer: (row: WorkOrderRow) => setSelectedRow(row),
      openView: (row: WorkOrderRow) => setViewRow(row),
    } as any,
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
    <Page title="Body Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Body Register"
          searchPlaceholder="Search body register..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "body-register")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Body Register List",
              "body-register",
            )
          }
        />

        <TabGroup
          selectedIndex={TAB_INDEX[tab]}
          onChange={(index) => setTab(INDEX_TAB[index])}
        >
          <div className="hide-scrollbar mt-4 overflow-x-auto px-(--margin-x)">
            <div className="border-gray-150 dark:border-dark-500 w-max min-w-full border-b-2">
              <TabList className="-mb-0.5 flex">
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "shrink-0 cursor-pointer space-x-2 border-b-2 px-3 py-2 font-medium whitespace-nowrap outline-none",
                      selected
                        ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                        : "dark:hover:text-dark-100 dark:focus:text-dark-100 border-transparent text-gray-600 hover:text-gray-800 focus:text-gray-800 dark:text-gray-300",
                    )
                  }
                >
                  <ClockIcon className="inline-block size-4.5" />
                  <span>Pending</span>
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "shrink-0 cursor-pointer space-x-2 border-b-2 px-3 py-2 font-medium whitespace-nowrap outline-none",
                      selected
                        ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                        : "dark:hover:text-dark-100 dark:focus:text-dark-100 border-transparent text-gray-600 hover:text-gray-800 focus:text-gray-800 dark:text-gray-300",
                    )
                  }
                >
                  <CheckCircleIcon className="inline-block size-4.5" />
                  <span>Generate</span>
                </Tab>
              </TabList>
            </div>
          </div>
        </TabGroup>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading work orders..."
              : tab === "pending"
                ? "No pending work orders found."
                : "No generated body registers found."
          }
        />
      </div>
      <BodyRegisterDrawer
        open={!!selectedRow}
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onSaved={() => {
          setSelectedRow(null);
          fetchAll(tab); // leaves Pending
        }}
      />

      <BodyRegisterViewDrawer
        open={!!viewRow}
        row={viewRow}
        onClose={() => setViewRow(null)}
      />
    </Page>
  );
}
