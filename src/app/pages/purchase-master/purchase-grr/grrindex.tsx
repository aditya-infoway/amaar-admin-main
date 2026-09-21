// src/app/pages/grr/index.tsx

// Import Dependencies
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  useReactTable,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";

// Local Imports
import { Page } from "@/components/shared/Page";
import { useThemeContext } from "@/app/contexts/theme/context";
import {
  Badge,
  Button,
  Card,
  Input,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";

// Table Imports
import { TableSortIcon } from "@/components/shared/table/TableSortIcon";
import { ColumnFilter } from "@/components/shared/table/ColumnFilter";
import { PaginationSection } from "@/components/shared/table/PaginationSection";
import {
  useBoxSize,
  useLockScrollbar,
  useLocalStorage,
  useDidUpdate,
} from "@/hooks";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

// GRR Specific Imports
import { GrrItem } from "./data";
import { columns, differenceColumns } from "./columns";
import { Toolbar } from "./Toolbar";
import { SelectedRowsActions } from "./SelectedRowsActions";

/* ───────────────────────── TYPES ───────────────────────── */
type PoOption = {
  id: number;
  poNumber: string;
  supplierName: string;
  supplierNumber: string;
  orderDate: string;
  requestedDate: string;
  serialNo: number | null;
  label: string;
};

type Stage = "verify" | "difference";

/* ───────────────────────── HELPERS ───────────────────────── */
function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`dark:border-dark-500 dark:bg-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="dark:border-dark-500 border-b border-gray-100 px-4 py-3 sm:px-5">
        <h2 className="dark:text-dark-50 text-sm font-bold text-gray-800">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="input-label mb-1.5 block">
      <span className="input-label dark:text-dark-100 font-semibold text-gray-700">
        {children}
        {required && <span className="text-error ml-0.5">*</span>}
      </span>
    </label>
  );
}

function formatDateForApi(date: Date): string {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const dy = String(date.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

function formatDateForDisplay(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="dark:bg-dark-700 bg-white px-4 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p className="dark:text-dark-50 mt-0.5 truncate text-sm font-semibold text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function GrrPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isViewMode = Boolean(id);
  const { cardSkin } = useThemeContext();
  const [stage, setStage] = useState<Stage>("verify");
  const [selectedPo, setSelectedPo] = useState<PoOption | null>(null);
  const [grrNo, setGrrNo] = useState("GRR-2026-001");
  const [grrDate, setGrrDate] = useState(new Date().toISOString().slice(0, 10));
  const [serialNo, setSerialNo] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierNumber, setSupplierNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<GrrItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [loadingGrr, setLoadingGrr] = useState(false);
  // TanStack Table State
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-grr",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-grr",
    {},
  );

  const [tableSettings, setTableSettings] = useState<any>({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });

  const financialYearId = localStorage.getItem("financialYearId");

  const [poOptions, setPoOptions] = useState<PoOption[]>([]);
  const [loadingPoList, setLoadingPoList] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!id || !financialYearId) return;

    const fetchGrr = async () => {
      setLoadingGrr(true);
      try {
        const res = await Get(`purchase-grr/${id}`, { financialYearId }, false);

        if (!res.data?.success) {
          toasterrormsg(res.data?.message || "Failed to load GRR");
          return;
        }

        const d = res.data.data;

        setGrrNo(d.grrNo || "");
        setGrrDate(d.grrDate?.slice(0, 10) || "");
        setRemarks(d.remarks || "");
        setSerialNo(d.serialNo ?? null);

        setItems(
          (d.items || []).map((row: any) => ({
            id: row.grrItemId ?? row.id,
            purchaseOrderDetailsId: row.purchaseOrderDetailsId ?? row.grrItemId,
            itemId: row.itemId,
            itemCode: row.itemCode,
            itemName: row.itemName,
            hsnCode: row.hsnCode,
            orderQty: Number(row.orderQty) || 0,
            inQty: Number(row.inQty) || 0,
            verified: true,
          })),
        );

        setStage("difference");

        // PO / supplier header: use the GRR response if it has it,
        // otherwise load it from the PO itself
        let po = {
          poNumber: d.poNumber || "",
          supplierName: d.supplierName || "",
          supplierNumber: d.supplierNumber || "",
          orderDate: d.orderDate || "",
          requestedDate: d.requestedDate || "",
        };

        if (!po.supplierName && d.purchaseOrderId) {
          try {
            const poRes = await Get(
              `purchase-grr/po-items/${d.purchaseOrderId}`,
              {},
              false,
            );

            if (poRes.data?.success) {
              const p = poRes.data.data;
              po = {
                poNumber: po.poNumber || p.poNumber || "",
                supplierName: p.supplierName || "",
                supplierNumber: p.supplierNumber || "",
                orderDate: p.orderDate || "",
                requestedDate: p.requestedDate || "",
              };
            }
          } catch {
            // header just stays blank
          }
        }

        setSupplierName(po.supplierName);
        setSupplierNumber(po.supplierNumber);
        setOrderDate(po.orderDate);
        setRequestedDate(po.requestedDate);

        setSelectedPo({
          id: d.purchaseOrderId,
          poNumber: po.poNumber,
          supplierName: po.supplierName,
          supplierNumber: po.supplierNumber,
          orderDate: po.orderDate,
          requestedDate: po.requestedDate,
          serialNo: d.serialNo ?? null,
          label: po.poNumber
            ? `${po.poNumber} - ${po.supplierName}`
            : po.supplierName,
        });
      } catch (e) {
        toasterrormsg("Failed to load GRR");
      } finally {
        setLoadingGrr(false);
      }
    };

    fetchGrr();
  }, [id, financialYearId]);



  useEffect(() => {
    if (!financialYearId) return;

    const fetchPoList = async () => {
      setLoadingPoList(true);
      try {
        const res = await Get(
          "purchase-grr/po-list",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          setPoOptions(res.data.data || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load purchase orders");
        }
      } catch (e) {
        toasterrormsg("Failed to load purchase orders");
      } finally {
        setLoadingPoList(false);
      }
    };

    const fetchNextGrrNo = async () => {
      try {
        const res = await Get(
          "purchase-grr/next-grr-no",
          { financialYearId },
          false,
        );
        if (res.data?.success) setGrrNo(res.data.data.grrNo);
      } catch (e) {
        // silent — GRR No. is cosmetic until save
      }
    };

    fetchPoList();
    if (!isViewMode) fetchNextGrrNo();
  }, [financialYearId, isViewMode]);

  const cardRef = useRef<HTMLDivElement>(null);
  useBoxSize({ ref: cardRef });

  // When PO is selected → fill header + load items
  // SKIP this entirely in view mode
  useEffect(() => {
    if (isViewMode) return; // ← critical guard

    if (!selectedPo) {
      setSupplierName("");
      setSupplierNumber("");
      setOrderDate("");
      setRequestedDate("");
      setItems([]);
      setSerialNo(null);
      return;
    }

    setSupplierName(selectedPo.supplierName);
    setSupplierNumber(selectedPo.supplierNumber);
    setOrderDate(selectedPo.orderDate);
    setRequestedDate(selectedPo.requestedDate);
    setSerialNo(selectedPo.serialNo ?? null);
    setStage("verify");

    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const res = await Get(
          `purchase-grr/po-items/${selectedPo.id}`,
          {},
          false,
        );
        if (!res.data?.success) {
          toasterrormsg(res.data?.message || "Failed to load PO items");
          setItems([]);
          return;
        }

        const data = res.data.data;
        setSupplierName(data.supplierName || "");
        setSupplierNumber(data.supplierNumber || "");
        setOrderDate(data.orderDate || "");
        setRequestedDate(data.requestedDate || "");
        setSerialNo(data.serialNo ?? null);

        setItems(
          (data.items || []).map((row: any) => ({
            id: row.purchaseOrderDetailsId,
            purchaseOrderDetailsId: row.purchaseOrderDetailsId,
            itemId: row.itemId,
            itemCode: row.itemCode,
            itemName: row.itemName,
            hsnCode: row.hsnCode,
            orderQty: row.orderQty,
            inQty: null,
            verified: false,
          })),
        );
      } catch (e) {
        toasterrormsg("Failed to load PO items");
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [selectedPo, isViewMode]); // ← add isViewMode to deps

  const allVerified = useMemo(
    () => items.length > 0 && items.every((i) => i.verified),
    [items],
  );
  const verifiedCount = useMemo(
    () => items.filter((i) => i.verified).length,
    [items],
  );

  const handleNext = () => {
    if (items.length === 0 || !allVerified) return;
    setStage("difference");
  };

  const handleBack = () => {
    setStage("verify");
  };

  const handleVerifyGrr = async () => {
    if (isViewMode) return;
    if (!selectedPo) return toasterrormsg("Please select a Purchase Order.");
    if (!financialYearId)
      return toasterrormsg("Financial Year not found in session.");
    const blankRow = items.find(
      (i) => i.inQty === null || i.inQty === undefined,
    );
    if (blankRow)
      return toasterrormsg(`In Qty is required for "${blankRow.itemName}".`);

    setSubmitting(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const roleName = localStorage.getItem("roleName");

      const res = await Post(
        "purchase-grr/create",
        {
          financialYearId,
          purchaseOrderId: selectedPo.id,
          grrDate,
          remarks,
          createdBy: companyId ? Number(companyId) : undefined,
          createdType: roleName || "Super Admin",
          items: items.map((i) => ({
            purchaseOrderDetailsId: i.purchaseOrderDetailsId,
            itemName: i.itemName,
            inQty: i.inQty,
          })),
        },
        false,
      );

      if (res.data?.success) {
        toastsuccessmsg(
          res.data.message || "GRR verified and saved successfully",
        );
        navigate("/purchase-master/purchase-grr");
      } else {
        toasterrormsg(res.data?.message || "Failed to save GRR");
      }
    } catch (e) {
      toasterrormsg("Failed to save GRR");
    } finally {
      setSubmitting(false);
    }
  };
  const activeColumns = useMemo(
    () => (stage === "difference" ? differenceColumns : columns),
    [stage],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: items,
    columns: activeColumns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      setTableSettings,
      updateData: (rowIndex: number, columnId: string, value: any) => {
        skipAutoResetPageIndex();
        setItems((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return { ...old[rowIndex], [columnId]: value };
            }
            return row;
          }),
        );
      },
      deleteRow: (row: any) => {
        skipAutoResetPageIndex();
        setItems((old) =>
          old.filter((oldRow) => oldRow.id !== row.original.id),
        );
      },
      deleteRows: (rows: any[]) => {
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.id);
        setItems((old) => old.filter((row) => !rowIds.includes(row.id)));
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

  const showActions = stage === "difference" && !isViewMode;

  return (
    <Page title="Goods Received Report">
      <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
        {/* ───── Page Header ───── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
              Goods Received Report (GRR)
            </h2>
            <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500">
              Select a Purchase Order → verify quantities → review differences
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/purchase-master/purchase-grr">
              <Button variant="outlined" className="gap-2">
                <ChevronLeftIcon className="size-4" />{" "}
                {isViewMode ? "Close" : "Cancel"}
              </Button>
            </Link>

            {stage === "verify" && (
              <Button
                color="primary"
                onClick={handleNext}
                disabled={!allVerified}
              >
                Next
              </Button>
            )}

            {showActions && (
              <>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  color="primary"
                  disabled={submitting}
                  onClick={handleVerifyGrr}
                >
                  {submitting ? "Saving..." : "Verify GRR"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ───── GRR Header Details ───── */}
        <div className="mt-4">
          <SectionCard title="GRR Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel required>Select PO No.</FieldLabel>
                <Combobox
                  data={poOptions}
                  displayField="label"
                  value={selectedPo}
                  onChange={(val: any) => setSelectedPo(val)}
                  placeholder="Search PO Number..."
                  searchFields={["poNumber", "supplierName"]}
                  disabled={isViewMode}
                />
              </div>

              <Input
                label="GRR No."
                value={grrNo}
                readOnly
                placeholder="Auto generated"
                classNames={{
                  labelText: "dark:text-dark-100 font-semibold text-gray-700",
                }}
              />

              <div
                className={isViewMode ? "pointer-events-none opacity-60" : ""}
              >
                <FieldLabel required>GRR Date</FieldLabel>
                <DatePicker
                  value={grrDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    setGrrDate(picked ? formatDateForApi(picked) : "");
                  }}
                  placeholder="Select Date"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
                Auto filled from selected PO
              </p>
              <div className="dark:bg-dark-500 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-gray-200 sm:grid-cols-3">
                <DetailField label="Serial No" value={serialNo ?? undefined} />
                <DetailField
                  label="Order Date"
                  value={
                    orderDate ? formatDateForDisplay(orderDate) : undefined
                  }
                />
                <DetailField
                  label="Requested Date"
                  value={
                    requestedDate
                      ? formatDateForDisplay(requestedDate)
                      : undefined
                  }
                />
                <DetailField label="Supplier Name" value={supplierName} />
                <DetailField label="Number" value={supplierNumber} />
                <DetailField label="Remarks" value={remarks} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ───── Item Table (Material-Availability style) ───── */}
        <div className="mt-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="dark:text-dark-100 truncate text-base font-medium tracking-wide text-gray-800">
              Item Details
            </h2>
           {items.length > 0 && !isViewMode && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="soft"
                  color={allVerified ? "success" : "warning"}
                  className="rounded-full"
                >
                  {verifiedCount} / {items.length} verified
                </Badge>
                {stage === "difference" && (
                  <Badge variant="soft" color="info" className="rounded-full">
                    Reviewing differences
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Card className="relative mt-3 flex grow flex-col" ref={cardRef}>
            <div className="table-wrapper min-w-full grow overflow-x-auto">
              {/* ───────── STAGE 1: Verify (TanStack Table) ───────── */}
              {stage === "verify" && (
                <>
                  <Toolbar table={table} />
                  <Table
                    hoverable
                    dense={tableSettings.enableRowDense}
                    className="w-full text-left rtl:text-right"
                  >
                    <THead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <Th
                              key={header.id}
                              className={clsx(
                                "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg",
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
                      {table.getRowModel().rows.map((row) => (
                        <Tr
                          key={row.id}
                          className={clsx(
                            "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                            row.getIsSelected() &&
                              "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                            row.original.verified &&
                              "bg-success/5 dark:bg-success/10",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
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
                          ))}
                        </Tr>
                      ))}
                    </TBody>
                  </Table>
                  <SelectedRowsActions table={table} />
                  {table.getCoreRowModel().rows.length > 0 && (
                    <div
                      className={clsx(
                        "px-4 pb-4 sm:px-5 sm:pt-4",
                        tableSettings.enableFullScreen &&
                          "dark:bg-dark-800 bg-gray-50",
                      )}
                    >
                      <PaginationSection table={table} />
                    </div>
                  )}
                </>
              )}

              {/* ───────── STAGE 2: Difference (Read-only Manual Table) ───────── */}
              {stage === "difference" && (
                <>
                  <Toolbar table={table} />
                  <Table
                    hoverable
                    dense={tableSettings.enableRowDense}
                    className="w-full text-left rtl:text-right"
                  >
                    <THead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <Th
                              key={header.id}
                              className={clsx(
                                "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg",
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
                      {table.getRowModel().rows.map((row) => (
                        <Tr
                          key={row.id}
                          className="dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200"
                        >
                          {row.getVisibleCells().map((cell) => (
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
                          ))}
                        </Tr>
                      ))}
                    </TBody>
                    {items.length > 0 && (
                      <tfoot>
                        <Tr className="border-primary/20 bg-primary/5 text-primary border-t-2 font-bold">
                          <Td colSpan={3} className="dark:bg-dark-800">
                            Total
                          </Td>
                          <Td className="dark:bg-dark-800 text-right">
                            {items.reduce((s, i) => s + i.orderQty, 0)}
                          </Td>
                          <Td className="dark:bg-dark-800 text-right">
                            {items.reduce((s, i) => s + (i.inQty ?? 0), 0)}
                          </Td>
                          <Td className="dark:bg-dark-800" />
                          <Td className="dark:bg-dark-800 text-right">
                            {items.reduce(
                              (s, i) => s + (i.orderQty - (i.inQty ?? 0)),
                              0,
                            )}
                          </Td>
                        </Tr>
                      </tfoot>
                    )}
                  </Table>
                  {table.getCoreRowModel().rows.length > 0 && (
                    <div
                      className={clsx(
                        "px-4 pb-4 sm:px-5 sm:pt-4",
                        tableSettings.enableFullScreen &&
                          "dark:bg-dark-800 bg-gray-50",
                      )}
                    >
                      <PaginationSection table={table} />
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* ───── Bottom Actions ───── */}
        <div className="dark:border-dark-500 mt-5 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
          <Link to="/purchase-master/purchase-grr">
            <Button variant="outlined">
              {isViewMode ? "Close" : "Cancel"}
            </Button>
          </Link>

          {stage === "verify" && (
            <Button
              color="primary"
              onClick={handleNext}
              disabled={!allVerified}
            >
              Next
            </Button>
          )}

          {showActions && (
            <>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button
                color="primary"
                disabled={submitting}
                onClick={handleVerifyGrr}
              >
                {submitting ? "Saving..." : "Verify GRR"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
