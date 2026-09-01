import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
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
import { Button, Input, Textarea } from "@/components/ui";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { exportToExcel, exportToPdf, importFromExcel } from "../shared/export";
import { MasterToolbar } from "../shared/MasterToolbar";
import { MasterTable } from "../shared/MasterTable";
import dayjs from "dayjs";
import { Upload } from "lucide-react";
import {
  Get,
  Post,
  Put,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";

// Import columns from the separate file
import { columns, exportColumns, CreatePricingItem } from "./pricingcolumn";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function CreatePricing() {
  // ─── STATE ──────────────────────────────────────────────────────────────

  const [data, setData] = useState<CreatePricingItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CreatePricingItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── FORM STATE ──────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    effectiveDate: "",
    exShowroomPrice: "",
  });

  const [codeChecking, setCodeChecking] = useState(false);
  const [codeMatched, setCodeMatched] = useState(false);

  useEffect(() => {
    const code = formData.code.trim();

    if (!code) {
      setCodeMatched(false);

      setFormData((prev) => ({
        ...prev,
        description: "",
      }));

      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCodeChecking(true);

        const response = await Get(
          "master/createpricing/check-code",
          { code },
          false,
        );

        const result = response?.data?.data;

        if (!result?.exists) {
          setCodeMatched(false);

          setFormData((prev) => ({
            ...prev,
            description: "",
          }));

          toasterrormsg("This code does not exist in Create Master.");

          return;
        }

        // Code matched
        setCodeMatched(true);

        setFormData((prev) => ({
          ...prev,
          code: result.code,
          description: result.description || "",
        }));
      } catch (error) {
        console.error("Code check error:", error);

        setCodeMatched(false);

        setFormData((prev) => ({
          ...prev,
          description: "",
        }));

        toasterrormsg("Unable to verify code.");
      } finally {
        setCodeChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.code]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const handleOpenEditDrawer = (item: CreatePricingItem) => {
    setEditing(item);

    setFormData({
      code: item.code,
      description: item.description,
      effectiveDate: item.effectiveDate || "",
      exShowroomPrice: item.exShowroomPrice,
    });

    setDrawerOpen(true);
  };

  const handleCheckCode = async () => {
    const code = formData.code.trim();

    if (!code) {
      setCodeMatched(false);
      setFormData((prev) => ({
        ...prev,
        description: "",
      }));

      toasterrormsg("Please enter a code");
      return;
    }

    try {
      setCodeChecking(true);
      setCodeMatched(false);

      const response = await Get(
        "master/createpricing/check-code",
        { code },
        false,
      );

      const result = response?.data?.data ?? response?.data;

      if (!result?.exists) {
        setFormData((prev) => ({
          ...prev,
          description: "",
        }));

        toasterrormsg("This code does not exist in Create Master.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        code: result.code,
        description: result.description || "",
      }));

      setCodeMatched(true);

      toastsuccessmsg("Code matched successfully.");
    } catch (error) {
      console.error("Code check error:", error);

      setCodeMatched(false);

      setFormData((prev) => ({
        ...prev,
        description: "",
      }));

      toasterrormsg("Unable to verify code. Please try again.");
    } finally {
      setCodeChecking(false);
    }
  };

  
  const fetchPricingList = async () => {
    try {
      setLoading(true);

      const response = await Get("master/createpricing/list", {}, false);

      const result = response?.data?.data || [];

      const mappedData: CreatePricingItem[] = result.map((item: any) => ({
        id: String(item.createPricingId),
        createPricingId: item.createPricingId,
        companyId: item.companyId,
        code: item.code || "",
        description: item.description || "",
        effectiveDate: item.effectiveDate
          ? dayjs(item.effectiveDate).format("DD-MM-YYYY")
          : "",
        exShowroomPrice: String(item.exShowroomPrice ?? ""),
        status: item.status || "active",
      }));

      setData(mappedData);
    } catch (error: any) {
      console.error("Fetch pricing list error:", error);

      toasterrormsg(
        error?.response?.data?.message || "Failed to fetch pricing list.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingList();
  }, []);

  const handleSave = async () => {
    // ============================================================
    // VALIDATION
    // ============================================================

    if (!formData.code.trim()) {
      toasterrormsg("Code is required");
      return;
    }

    if (!codeMatched) {
      toasterrormsg("Please enter a valid Create Master code.");
      return;
    }

    if (!formData.description.trim()) {
      toasterrormsg("Description is required");
      return;
    }

    if (!formData.effectiveDate.trim()) {
      toasterrormsg("Effective Date is required");
      return;
    }

    if (!formData.exShowroomPrice.trim()) {
      toasterrormsg("Ex-Showroom Price is required");
      return;
    }

    try {
      setLoading(true);

      // ============================================================
      // UPDATE
      // ============================================================

      if (editing) {
        const payload = {
          createPricingId: editing.createPricingId,
          code: formData.code.trim(),
          description: formData.description.trim(),
          effectiveDate: formatDateForApi(formData.effectiveDate),
          exShowroomPrice: Number(formData.exShowroomPrice),
          status: editing.status || "active",
        };

        const response = await Put(
          "master/createpricing/update",
          payload,
          false,
        );

        if (response?.data?.success === false) {
          toasterrormsg(response?.data?.message || "Failed to update pricing");
          return;
        }

        toastsuccessmsg(
          response?.data?.message || "Pricing updated successfully",
        );
      }

      // ============================================================
      // CREATE
      // ============================================================
      else {
        const payload = {
          code: formData.code.trim(),
          description: formData.description.trim(),
          effectiveDate: formatDateForApi(formData.effectiveDate),
          exShowroomPrice: Number(formData.exShowroomPrice),
        };

        const response = await Post(
          "master/createpricing/create",
          payload,
          false,
        );

        if (response?.data?.success === false) {
          toasterrormsg(response?.data?.message || "Failed to create pricing");
          return;
        }

        toastsuccessmsg(
          response?.data?.message || "Pricing created successfully",
        );
      }

      // ============================================================
      // REFRESH LIST FROM DATABASE
      // ============================================================

      await fetchPricingList();

      // ============================================================
      // RESET FORM
      // ============================================================

      setDrawerOpen(false);
      setEditing(null);

      setFormData({
        code: "",
        description: "",
        effectiveDate: "",
        exShowroomPrice: "",
      });

      setCodeMatched(false);
    } catch (error: any) {
      console.error("Save pricing error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          "Something went wrong while saving pricing.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (row: CreatePricingItem) => {
    try {
      setLoading(true);

      const response = await Delete(
        "master/createpricing/delete",
        {
          createPricingId: row.createPricingId,
        },
        false,
      );

      if (response?.data?.success === false) {
        toasterrormsg(response?.data?.message || "Failed to delete pricing");
        return;
      }

      toastsuccessmsg(
        response?.data?.message || "Pricing deleted successfully",
      );

      await fetchPricingList();
    } catch (error: any) {
      console.error("Delete pricing error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          "Something went wrong while deleting pricing.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMany = async (rows: { original: CreatePricingItem }[]) => {
    try {
      setLoading(true);

      for (const row of rows) {
        const response = await Delete(
          "master/createpricing/delete",
          {
            createPricingId: row.original.createPricingId,
          },
          false,
        );

        if (response?.data?.success === false) {
          toasterrormsg(
            response?.data?.message || `Failed to delete ${row.original.code}`,
          );
          return;
        }
      }

      toastsuccessmsg(`${rows.length} pricing item(s) deleted successfully.`);

      setRowSelection({});
      await fetchPricingList();
    } catch (error: any) {
      console.error("Bulk delete pricing error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          "Something went wrong while deleting pricing.",
      );
    } finally {
      setLoading(false);
    }
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

  const handleImportExcel = async (file: File) => {
    try {
      setLoading(true);

      const columnMapping = {
        Code: "code",
        Description: "description",
        "Effective Date": "effectiveDate",
        "Ex-Showroom Price": "exShowroomPrice",
      } as const;

      const importedData = await importFromExcel<Partial<CreatePricingItem>>(
        file,
        columnMapping as any,
      );

      // ============================================================
      // REMOVE COMPLETELY EMPTY EXCEL ROWS
      // ============================================================

      const cleanedData = importedData.filter((item) => {
        const code = String(item.code ?? "").trim();
        const description = String(item.description ?? "").trim();
        const effectiveDate = String(item.effectiveDate ?? "").trim();
        const price = String(item.exShowroomPrice ?? "").trim();

        // Keep row only if at least one field contains data
        return code || description || effectiveDate || price;
      });

      if (!cleanedData.length) {
        toasterrormsg("No valid data found in the file.");
        return;
      }

      // ============================================================
      // CREATE PAYLOAD
      // ============================================================

      const payload = {
        items: cleanedData.map((item) => ({
          code: String(item.code ?? "").trim(),

          description: String(item.description ?? "").trim(),

          effectiveDate:
            item.effectiveDate === undefined ||
            item.effectiveDate === null ||
            String(item.effectiveDate).trim() === ""
              ? null
              : item.effectiveDate,

          exShowroomPrice:
            item.exShowroomPrice === undefined ||
            item.exShowroomPrice === null ||
            String(item.exShowroomPrice).trim() === ""
              ? null
              : Number(item.exShowroomPrice),
        })),
      };

      console.log("Bulk pricing payload:", payload);

      // ============================================================
      // SEND TO BACKEND
      // ============================================================

      const response = await Post(
        "master/createpricing/bulk-import",
        payload,
        false,
      );

      if (response?.data?.success === false) {
        toasterrormsg(response?.data?.message || "Failed to import pricing.");
        return;
      }

      // ============================================================
      // SUCCESS
      // ============================================================

      const result = response?.data?.data;

      toastsuccessmsg(
        response?.data?.message ||
          `${cleanedData.length} pricing record(s) imported successfully.`,
      );

      console.log("Import result:", result);

      await fetchPricingList();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Import pricing error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          "Failed to import pricing. Please check the Excel file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);

      const response = await Get("master/createpricing/", {}, false);

      const createMasterData = response?.data?.data || [];

      if (!createMasterData.length) {
        toasterrormsg("No Create Master data found to export.");
        return;
      }

      // ============================================================
      // CREATE PRICING IMPORT TEMPLATE
      // ============================================================

      const exportData: CreatePricingItem[] = createMasterData.map(
        (item: any, index: number) => ({
          id: String(index + 1),
          createPricingId: 0,
          companyId: 0,

          // From Create Master
          code: item.code || "",
          description: item.description || "",

          // Keep these BLANK
          effectiveDate: "",
          exShowroomPrice: "",

          status: "active",
        }),
      );

      exportToExcel(exportData, exportColumns, "createpricing");
    } catch (error: any) {
      console.error("Export pricing error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          "Failed to export Create Master pricing data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── TABLE SETUP ──────────────────────────────────────────────────────────

  const table = useReactTable({
    data: data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: CreatePricingItem) => {
        handleOpenEditDrawer(row);
      },
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="transition-content w-full pb-5">
      <MasterToolbar
        title="Create Pricing"
        createLabel="Create Pricing"
        searchPlaceholder="Search by Code, Description..."
        table={table}
        showFilters={false}
        onToggleFilters={() => {}}
        onCreate={() => {
          setEditing(null);
          setFormData({
            code: "",
            description: "",
            effectiveDate: "",
            exShowroomPrice: "",
          });
          setDrawerOpen(true);
        }}
        importButton={
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={triggerFileUpload}
          >
            <Upload className="size-4" />
            <span>Import</span>
          </Button>
        }
        onExportExcel={handleExportExcel}
        onExportPdf={() => {}} // Empty function to hide PDF button (or remove PDF button from toolbar)
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImportExcel(file);
          }
        }}
      />

      <MasterTable
        table={table}
        columnCount={columns.length}
        emptyMessage={
          loading
            ? "Loading Pricing data..."
            : "No pricing records found. Click Create Pricing to add one."
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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-xl transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="flex h-full flex-col"
              >
                <div className="bg-primary-600 dark:bg-primary-700 flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editing ? "Edit Pricing" : "Create Pricing"}
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
                  {/* Code */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Create Master code"
                      value={formData.code}
                      onChange={(e) => {
                        setCodeMatched(false);

                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value,
                          description: "",
                        }));
                      }}
                      className="w-full"
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

                  {/* Effective Date */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Effective Date <span className="text-red-500">*</span>
                    </label>

                    <DatePicker
                      placeholder="Select effective date"
                      value={
                        formData.effectiveDate
                          ? [
                              dayjs(
                                formData.effectiveDate,
                                "DD-MM-YYYY",
                              ).toDate(),
                            ]
                          : []
                      }
                      onChange={handleEffectiveDateChange}
                      className="w-full"
                    />
                  </div>

                  {/* Ex-Showroom Price */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ex-Showroom Price <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter ex-showroom price"
                      value={formData.exShowroomPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exShowroomPrice: e.target.value,
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
                    {editing ? "Update" : "Save"}
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
