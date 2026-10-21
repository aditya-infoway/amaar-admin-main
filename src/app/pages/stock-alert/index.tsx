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
import { useNavigate } from "react-router";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import clsx from "clsx";
import {
  HomeIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import {
  mapApiStockReportItemToStockReportItem,
  StockReportItem,
} from "./data";

type AlertTab = "all" | "min" | "max";
const TABS: { key: AlertTab; label: string; icon: any }[] = [
  { key: "all", label: "All", icon: HomeIcon },
  { key: "min", label: "Min", icon: ArrowTrendingDownIcon },
  { key: "max", label: "Max", icon: ArrowTrendingUpIcon },
];

// Min tab: stock has fallen to/below Min Qty
const isBelowMin = (i: StockReportItem) =>
  Number(i.minQty) > 0 && Number(i.currentStock) <= Number(i.minQty);
// Max tab: stock has reached/exceeded Max Qty
const isAboveMax = (i: StockReportItem) =>
  Number(i.maxQty) > 0 && Number(i.currentStock) >= Number(i.maxQty);

export default function StockAlertPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StockReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterTab, setFilterTab] = useState<AlertTab>("all");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("stockreport/list", {}, false);
      if (response.data?.success) {
        setData(
          (response.data.data || []).map(
            mapApiStockReportItemToStockReportItem,
          ),
        );
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch stock alert.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching stock alert.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((i) => i.categoryName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((n) => ({ id: n, label: n })),
    ];
  }, [data]);

  const groupOptions = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((i) => i.groupName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((n) => ({ id: n, label: n })),
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryName !== filterCategory) return false;
      if (filterGroup && item.groupName !== filterGroup) return false;
      if (filterTab === "min" && !isBelowMin(item)) return false;
      if (filterTab === "max" && !isAboveMax(item)) return false;
      return true;
    });
  }, [data, filterCategory, filterGroup, filterTab]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      viewRow: (row: StockReportItem) => navigate(`/stock-report/${row.id}`),
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
    <Page title="Stock Alert">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Stock Alert"
          searchPlaceholder="Search item name, HSN, category..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "stock-alert")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Stock Alert",
              "stock-alert",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Listbox
                data={categoryOptions}
                value={
                  categoryOptions.find((i) => i.id === filterCategory) ||
                  categoryOptions[0]
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={groupOptions}
                value={
                  groupOptions.find((i) => i.id === filterGroup) ||
                  groupOptions[0]
                }
                onChange={(item) => setFilterGroup(item.id)}
                label="Group"
                placeholder="All groups"
                displayField="label"
              />
            </div>
          }
        />

        <TabGroup
          selectedIndex={TABS.findIndex((t) => t.key === filterTab)}
          onChange={(index) => setFilterTab(TABS[index].key)}
        >
          <div className="hide-scrollbar mt-4 overflow-x-auto px-(--margin-x)">
            <div className="border-gray-150 dark:border-dark-500 w-max min-w-full border-b-2">
              <TabList className="-mb-0.5 flex">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <Tab
                    key={key}
                    className={({ selected }) =>
                      clsx(
                        "shrink-0 cursor-pointer space-x-2 border-b-2 px-3 py-2 font-medium whitespace-nowrap outline-none",
                        selected
                          ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                          : "dark:hover:text-dark-100 dark:focus:text-dark-100 border-transparent text-gray-600 hover:text-gray-800 focus:text-gray-800 dark:text-gray-300",
                      )
                    }
                  >
                    <Icon className="inline-block size-4.5" />
                    <span>{label}</span>
                  </Tab>
                ))}
              </TabList>
            </div>
          </div>
        </TabGroup>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading stock alert..." : "No stock alerts found."
          }
        />
      </div>
    </Page>
  );
}
