// Import Dependencies
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  // PlusIcon,
} from "@heroicons/react/20/solid";

// Local Imports
import { TableSortIcon } from "@/components/shared/table/TableSortIcon";
import { ColumnFilter } from "@/components/shared/table/ColumnFilter";
import { PaginationSection } from "@/components/shared/table/PaginationSection";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import {  Card, Table, THead, TBody, Th, Tr, Td } from "@/components/ui";
import {
  useBoxSize,
  useLockScrollbar,
  useLocalStorage,
  useDidUpdate,
} from "@/hooks";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Get, toasterrormsg } from "@/ApiHelper";
import { SelectedRowsActions } from "./SelectedRowsActions";
import { columns } from "./columns";
import { materialList, type MaterialItem } from "./data";
import { Toolbar } from "./Toolbar";
import { useThemeContext } from "@/app/contexts/theme/context";
import { TableSettings } from "@/components/shared/table/TableSettings";

// ----------------------------------------------------------------------

interface WorkOrderOption {
  id: number;
  workOrderNo: string;
  customerName: string;
  model?: string;
  label: string;
}

export default function MaterialAvailability() {
  const { cardSkin } = useThemeContext();

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const [items, setItems] = useState<MaterialItem[]>([...materialList]);

  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-material-availability",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-material-availability",
    {},
  );

  const cardRef = useRef<HTMLDivElement>(null);

  useBoxSize({ ref: cardRef });

  // ---- Work Order selector ----
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderOption | null>(null);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setWorkOrderLoading(true);

        const financialYearId = localStorage.getItem("financialYearId");

        const response = await Get(
          "workorder/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response?.data?.data || [];

          setWorkOrders(
            list.map((item: any) => ({
              id: Number(item.id),
              workOrderNo: item.workOrderNo || "",
              customerName: item.customerName || "",
              model: item.modelName || item.model || "",
              label: `${item.workOrderNo || "-"} | ${item.customerName || "-"} | ${item.modelName || item.model || "-"}`,
            })),
          );
        }
      } catch (error) {
        console.error("Work Order list error:", error);
        toasterrormsg("Unable to load work orders.");
      } finally {
        setWorkOrderLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const handleSelectWorkOrder = (value: any) => {
    const order: WorkOrderOption | null = Array.isArray(value)
      ? value[0] || null
      : value || null;

    setSelectedWorkOrder(order);

    // TODO: once material list is linked to a work order,
    // filter/fetch `items` here based on `order`.
  };

  // ---- Stat summary ----
  const totalItems = items.length;
  const shortItems = items.filter(
    (item) => item.available_stock < item.required_stock,
  ).length;
  const poPending = items.filter((item) => item.po_status === "pending").length;
  const poRaised = items.filter((item) => item.po_status === "raised").length;

  const table = useReactTable({
    data: items,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      setTableSettings,
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setItems((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          }),
        );
      },
      deleteRow: (row) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setItems((old) =>
          old.filter((oldRow) => oldRow.item_id !== row.original.item_id),
        );
      },
      deleteRows: (rows) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.item_id);
        setItems((old) => old.filter((row) => !rowIds.includes(row.item_id)));
      },
    },

    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,

    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [items]);

  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_auto_1fr] px-(--margin-x) py-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="min-w-0">
          <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
            Material Availability
          </h2>
        </div>
        {/* <Button
          className="h-8 space-x-1.5 rounded-md px-3 text-xs"
          color="primary"
        >
          <PlusIcon className="size-5" />
          <span>Add Item</span>
        </Button> */}
      </div>

      <div className="mt-4 max-w-md">
        <Combobox
          data={workOrders}
          displayField="label"
          value={selectedWorkOrder}
          onChange={handleSelectWorkOrder}
          placeholder="ID | Name | Model"
          label="Work Order"
          searchFields={["workOrderNo", "customerName", "model"]}
          disabled={workOrderLoading}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 2xl:gap-6">
        <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
              {totalItems}
            </p>
            <ArchiveBoxIcon className="text-secondary size-5" />
          </div>
          <p className="text-xs-plus mt-1">Total Items</p>
        </div>
        <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
              {shortItems}
            </p>
            <ExclamationTriangleIcon className="text-error size-5" />
          </div>
          <p className="text-xs-plus mt-1">Short Stock</p>
        </div>
        <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
              {poPending}
            </p>
            <ClipboardDocumentCheckIcon className="text-warning size-5" />
          </div>
          <p className="text-xs-plus mt-1">PO Pending</p>
        </div>
        <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
              {poRaised}
            </p>
            <ClipboardDocumentCheckIcon className="text-info size-5" />
          </div>
          <p className="text-xs-plus mt-1">PO Raised</p>
        </div>
      </div>
      <div
        className={clsx(
          "flex flex-col pt-4",
          tableSettings.enableFullScreen &&
            "dark:bg-dark-900 fixed inset-0 z-61 h-full w-full bg-white pt-3",
        )}
      >
        <Toolbar table={table} />
        <Card
          className={clsx(
            "relative mt-3 flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden",
          )}
          ref={cardRef}
        >
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                          header.column.getCanPin() && [
                            header.column.getIsPinned() === "left" &&
                              "sticky z-2 ltr:left-0 rtl:right-0",
                            header.column.getIsPinned() === "right" &&
                              "sticky z-2 ltr:right-0 rtl:left-0",
                          ],
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer items-center space-x-3 select-none"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </span>
                            <TableSortIcon
                              sorted={header.column.getIsSorted()}
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                        {header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <Tr
                      key={row.id}
                      className={clsx(
                        "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                        row.getIsSelected() &&
                          "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            className={clsx(
                              "relative",
                              cardSkin === "shadow"
                                ? "dark:bg-dark-700"
                                : "dark:bg-dark-900",

                              cell.column.getCanPin() && [
                                cell.column.getIsPinned() === "left" &&
                                  "sticky z-2 ltr:left-0 rtl:right-0",
                                cell.column.getIsPinned() === "right" &&
                                  "sticky z-2 ltr:right-0 rtl:left-0",
                              ],
                            )}
                          >
                            {cell.column.getIsPinned() && (
                              <div
                                className={clsx(
                                  "dark:border-dark-500 pointer-events-none absolute inset-0 border-gray-200",
                                  cell.column.getIsPinned() === "left"
                                    ? "ltr:border-r rtl:border-l"
                                    : "ltr:border-l rtl:border-r",
                                )}
                              ></div>
                            )}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
          </div>
          <SelectedRowsActions table={table} />
          {table.getCoreRowModel().rows.length && (
            <div
              className={clsx(
                "px-4 pb-4 sm:px-5 sm:pt-4",
                tableSettings.enableFullScreen && "dark:bg-dark-800 bg-gray-50",
                !(
                  table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
                ) && "pt-4",
              )}
            >
              <PaginationSection table={table} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}