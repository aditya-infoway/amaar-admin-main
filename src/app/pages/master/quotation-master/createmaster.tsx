import React, { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Button, Input, Textarea } from "@/components/ui";

import { exportToExcel, exportToPdf } from "../shared/export";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import MultiSelect from "@/components/shared/form/MultiSelect";
import { Fragment } from "react";
import {
  Get,
  Post,
  Put,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";
import dayjs from "dayjs";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterToolbar } from "../shared/MasterToolbar";
import { MasterTable } from "../shared/MasterTable";

// Import your columns and exportColumns
import { columns, exportColumns, CreateMasterItem } from "./columns";

interface MultiSelectOption {
  id: string;
  name: string;
  weight: number;
}

interface ItemMasterItem {
  itemId: number;
  itemName: string;
  categoryName: string;
  [key: string]: any;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function CreateMaster() {
  const [data, setData] = useState<CreateMasterItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CreateMasterItem | null>(null);
  const [codeExists, setCodeExists] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const [itemMasterData, setItemMasterData] = useState<ItemMasterItem[]>([]);
  const [itemCategoryData, setItemCategoryData] = useState<any[]>([]);

  // ─── FORM STATE ──────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<{
    type: string;
    description: string;
    actualItem: MultiSelectOption[];
    code: string;
    totalWeight: string;
  }>({
    type: "",
    description: "",
    actualItem: [],
    code: "",
    totalWeight: "",
  });

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const formatDateForPicker = (date: any): string => {
    if (!date) return "";

    if (typeof date?.format === "function") {
      return date.format("DD-MM-YYYY");
    }

    if (date instanceof Date) {
      return dayjs(date).format("DD-MM-YYYY");
    }

    if (typeof date === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
        const [year, month, day] = date.substring(0, 10).split("-");
        return `${day}-${month}-${year}`;
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date;
      }
    }

    return "";
  };

  const getDatePickerValue = (date: string): Date | undefined => {
    if (!date) return undefined;

    const [day, month, year] = date.split("-");

    if (!day || !month || !year) return undefined;

    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const handleEffectiveDateChange = (selectedDates: Date[]) => {
    const selectedDate = selectedDates?.[0];

    setFormData((prev) => ({
      ...prev,
      effectiveDate: selectedDate
        ? dayjs(selectedDate).format("DD-MM-YYYY")
        : "",
    }));
  };

  

  const formatDateForApi = (date: string): string => {
    if (!date) return "";

    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split("-");
      return `${year}-${month}-${day}`;
    }

    return date;
  };

  const handleOpenEditDrawer = (item: CreateMasterItem) => {
    setEditing(item);

    const selectedItems: MultiSelectOption[] = Array.isArray(item.actualItem)
      ? (item.actualItem
          .map((selected: any) => {
            const itemId = String(selected?.id ?? selected?.itemId ?? selected);

            const masterItem = itemMasterData.find(
              (master: ItemMasterItem) => String(master.itemId) === itemId,
            );

            if (!masterItem) {
              return null;
            }

            return {
              id: String(masterItem.itemId),
              name: masterItem.itemName,
              weight: Number(masterItem.weight ?? 0),
            };
          })
          .filter(Boolean) as MultiSelectOption[])
      : [];

    // Always calculate weight from selected actual items
    const calculatedWeight = selectedItems.reduce(
      (total, selected) => total + Number(selected.weight || 0),
      0,
    );

    setFormData({
      type: String(item.type ?? ""),
      description: String(item.description ?? ""),
      actualItem: selectedItems,
      code: String(item.code ?? ""),
      totalWeight: String(calculatedWeight),
    });

    // Existing code is allowed while editing.
    // API will exclude current createMasterId from duplicate check.
    setCodeExists(false);
    setCheckingCode(false);

    setDrawerOpen(true);
  };

  const handleSave = async (item: CreateMasterItem | null) => {
    try {
      // ============================================================
      // VALIDATION
      // ============================================================

      if (!formData.type.trim()) {
        toasterrormsg("Type is required");
        return;
      }

      if (!formData.description.trim()) {
        toasterrormsg("Description is required");
        return;
      }

      if (formData.actualItem.length === 0) {
        toasterrormsg("Actual Item is required");
        return;
      }

      if (!formData.code.trim()) {
        toasterrormsg("Code is required");
        return;
      }

      if (checkingCode) {
        toasterrormsg("Please wait while checking code");
        return;
      }

      if (codeExists) {
        toasterrormsg("This code already exists");
        return;
      }

      // Calculate weight again before saving.
      // Do not depend only on the input value.
      const totalWeight = formData.actualItem.reduce(
        (total, item) => total + Number(item.weight || 0),
        0,
      );

      if (totalWeight <= 0) {
        toasterrormsg("Total Weight is required");
        return;
      }

      // ============================================================
      // PAYLOAD
      // ============================================================

      const payload = {
        type: formData.type.trim(),
        description: formData.description.trim(),

        // Send only the required item information
        actualItem: formData.actualItem.map((item) => ({
          id: item.id,
          name: item.name,
          weight: Number(item.weight || 0),
        })),

        code: formData.code.trim(),

        totalWeight,

        status: "active",
      };

      setLoading(true);

      // ============================================================
      // UPDATE
      // ============================================================

      if (item?.createMasterId) {
        await Put(
          "master/createmaster/update",
          {
            createMasterId: item.createMasterId,
            ...payload,
          },
          false,
        );

        toastsuccessmsg("Create Master updated successfully");
      }

      // ============================================================
      // CREATE
      // ============================================================
      else {
        await Post("master/createmaster/create", payload, false);

        toastsuccessmsg("Create Master created successfully");
      }

      // ============================================================
      // RESET
      // ============================================================

      setDrawerOpen(false);

      setFormData({
        type: "",
        description: "",
        actualItem: [],
        code: "",
        totalWeight: "",
      });

      setEditing(null);
      setCodeExists(false);
      setCheckingCode(false);

      await fetchCreateMasterList();
    } catch (error: any) {
      console.error("Create Master save error:", error);

      toasterrormsg(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (row: CreateMasterItem) => {
    // Show confirmation dialog

    try {
      setLoading(true);
      await Delete(
        "master/createmaster/delete",
        {
          createMasterId: row.createMasterId,
        },
        false,
      );
      toastsuccessmsg("Create Master deleted successfully");
      setData((prev) =>
        prev.filter((item) => item.createMasterId !== row.createMasterId),
      );
    } catch (error: any) {
      console.error("Delete Create Master error:", error);
      toasterrormsg(
        error?.response?.data?.message || "Failed to delete Create Master",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMany = async (rows: { original: CreateMasterItem }[]) => {
    try {
      setLoading(true);
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/createmaster/delete",
            { createMasterId: r.original.createMasterId },
            false,
          ),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.createMasterId));
      setData((prev) => prev.filter((item) => !ids.has(item.createMasterId)));
      setRowSelection({});
      toastsuccessmsg("Selected Create Masters deleted successfully.");
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toasterrormsg("Something went wrong while deleting items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateMasterList = async () => {
    try {
      setLoading(true);
      const response = await Get("master/createmaster/list", {}, false);

      if (response?.data?.status === 200 || response?.data?.success) {
        const apiData = response?.data?.data || [];
        const formattedData: CreateMasterItem[] = apiData.map((item: any) => ({
          ...item,
          id: String(item.createMasterId),
        }));
        setData(formattedData);
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to fetch Create Master list",
        );
      }
    } catch (error: any) {
      console.error("Create Master list error:", error);
      toasterrormsg(
        error?.response?.data?.message || "Failed to fetch Create Master list",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchItemMasterList = async () => {
    try {
      const response = await Get("master/itemmaster/list", {}, false);

      if (response?.data?.status === 200 || response?.data?.success) {
        const data = response?.data?.data || [];
        setItemMasterData(data);
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to fetch Item Master list",
        );
      }
    } catch (error: any) {
      console.error("Item Master list error:", error);
      toasterrormsg(
        error?.response?.data?.message || "Failed to fetch Item Master list",
      );
    }
  };

  const fetchItemCategoryList = async () => {
    try {
      const response = await Get("master/itemcategory/list", {}, false);

      if (response?.data?.status === 200 || response?.data?.success) {
        const data = response?.data?.data || [];
        setItemCategoryData(data);
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to fetch Item Category list",
        );
      }
    } catch (error: any) {
      console.error("Item Category list error:", error);
      toasterrormsg(
        error?.response?.data?.message || "Failed to fetch Item Category list",
      );
    }
  };

  useEffect(() => {
    fetchCreateMasterList();
    fetchItemMasterList();
    fetchItemCategoryList();
  }, []);

  useEffect(() => {
    const code = formData.code.trim();

    // Nothing to check
    if (!code) {
      setCodeExists(false);
      setCheckingCode(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingCode(true);

        const response = await Get(
          "master/createmaster/check-code",
          {
            code,

            // Important:
            // when editing, backend should ignore this current record
            // while checking duplicate code.
            createMasterId: editing?.createMasterId ?? undefined,
          },
          false,
        );

        const exists = response?.data?.data?.exists === true;

        setCodeExists(exists);
      } catch (error) {
        console.error("Check Create Master code error:", error);

        // Don't block user because checking API failed.
        setCodeExists(false);
      } finally {
        setCheckingCode(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [formData.code, editing?.createMasterId]);

  // ─── TABLE SETUP ──────────────────────────────────────────────────────────

  const table = useReactTable({
    data: data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.createMasterId),
    meta: {
      openEditDrawer: (row: CreateMasterItem) => {
        handleOpenEditDrawer(row);
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

  // ─── FORM OPTIONS ─────────────────────────────────────────────────────────

  const actualItemOptions: MultiSelectOption[] = itemMasterData
    .filter((item) => {
      if (!formData.type) return false;

      const itemCategory = String(item.categoryName ?? "")
        .trim()
        .toLowerCase();

      const selectedType = String(formData.type ?? "")
        .trim()
        .toLowerCase();

      return itemCategory === selectedType;
    })
    .map((item) => ({
      id: String(item.itemId),
      name: item.itemName,
      weight: Number(item.weight ?? 0),
    }));

  const typeOptions = itemCategoryData
    .filter(
      (item) =>
        String(item.categoryType ?? "")
          .trim()
          .toLowerCase() === "default",
    )
    .map((item) => ({
      id: String(item.itemCategoryId),
      name: item.categoryName,
    }));

  return (
    <div className="transition-content w-full pb-5">
      <MasterToolbar
        title="Create Master"
        createLabel="Create Quotation Master"
        searchPlaceholder="Search by Type, Description, Actual Item..."
        table={table}
        showFilters={false}
        onToggleFilters={() => {}}
        onCreate={() => {
          setEditing(null);
          setFormData({
            type: "",
            description: "",
            actualItem: [],
            code: "",
            totalWeight: "",
          });
          setDrawerOpen(true);
        }}
        onExportExcel={() => exportToExcel(data, exportColumns, "createmaster")}
        onExportPdf={() =>
          exportToPdf(data, exportColumns, "Create Master List", "createmaster")
        }
      />

      <MasterTable
        table={table}
        columnCount={columns.length}
        emptyMessage={
          loading
            ? "Loading Create Masters..."
            : "No Create Masters found. Click Create Quotation Master to add one."
        }
      />

      {/* Add/Edit Right Side Drawer */}
      <Transition appear show={drawerOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={() => setDrawerOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(editing!);
                }}
                className="flex h-full flex-col"
              >
                <div className="bg-primary-600 dark:bg-primary-700 flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editing?.createMasterId
                      ? "Edit Quotation Master"
                      : "Create Quotation Master"}
                  </h2>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    type="button"
                    className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grow space-y-5 overflow-y-auto p-6">
                  {/* Type - Search Dropdown */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      data={typeOptions}
                      displayField="name"
                      value={
                        typeOptions.find((opt) => opt.name === formData.type) ||
                        null
                      }
                      onChange={(selected: any) => {
                        setFormData({
                          ...formData,
                          type: selected?.name || "",
                          actualItem: [],
                        });
                      }}
                      placeholder="Select Type"
                      searchFields={["name"]}
                    />
                  </div>

                  {/* Actual Item - Multi Select with Checkbox */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actual Item <span className="text-red-500">*</span>
                    </label>

                    <MultiSelect
                      data={actualItemOptions}
                      displayField="name"
                      value={formData.actualItem}
                      onChange={(selected) => {
                        const items: MultiSelectOption[] = (selected || []).map(
                          (item) => {
                            const masterItem = itemMasterData.find(
                              (master: ItemMasterItem) =>
                                String(master.itemId) === String(item.id),
                            );

                            return {
                              id: String(item.id),
                              name: item.name,
                              weight: Number(masterItem?.weight ?? 0),
                            };
                          },
                        );

                        const totalWeight = items.reduce(
                          (total, item) => total + Number(item.weight || 0),
                          0,
                        );

                        setFormData((prev) => ({
                          ...prev,
                          actualItem: items,
                          totalWeight: String(totalWeight),
                        }));
                      }}
                      placeholder={
                        formData.type
                          ? "Select Actual Items..."
                          : "Select Type first..."
                      }
                      searchFields={["name"]}
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Code <span className="text-red-500">*</span>
                    </label>

                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={formData.code}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          code: e.target.value,
                        });

                        setCodeExists(false);
                      }}
                      className={`w-full ${codeExists ? "border-red-500" : ""}`}
                    />

                    {checkingCode && (
                      <p className="mt-1 text-sm text-gray-500">
                        Checking code...
                      </p>
                    )}

                    {codeExists && (
                      <p className="mt-1 text-sm text-red-500">
                        This code is already exist
                      </p>
                    )}
                  </div>

                  {/* Total Weight */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Weight
                    </label>

                    <Input
                      type="number"
                      placeholder="Auto calculated"
                      value={formData.totalWeight}
                      readOnly
                      className="w-full bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Enter description"
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">
                  <Button
                    variant="outlined"
                    color="neutral"
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="h-10 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" className="h-10 w-1/2">
                    {editing?.createMasterId ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
