import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
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

interface MultiSelectOption {
  id: string;
  name: string;
}

interface CreateMasterItem {
  createMasterId: number;
  companyId: number;
  type: string;
  description: string;
  actualItem: MultiSelectOption[];
  exShowroom: string;
  effectiveDate: string;
  status: string;
  created?: string;
}

// ─── TYPE OPTIONS ──────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { id: "trailer-detail", name: "Trailer Detail" },
  { id: "main-chassis", name: "Main Chassis" },
  { id: "body-details", name: "Body Details" },
  { id: "hyd-kit", name: "Hyd Kit" },
  { id: "axle", name: "Axle" },
  { id: "suspension", name: "Suspension" },
  { id: "tyre", name: "Tyre" },
  { id: "rim", name: "Rim" },
  { id: "king-pin", name: "King Pin" },
  { id: "landing-leg", name: "Landing Leg" },
  { id: "brake-system", name: "Brake system" },
  { id: "mudgaurd", name: "Mudgaurd" },
  { id: "paint", name: "Paint" },
  { id: "electrical-reflective", name: "Electrical & Reflective tapes" },
  { id: "supd-rupd", name: "SUPD & RUPD" },
  { id: "tool-box", name: "Tool Box" },
  { id: "spare-wheel", name: "Spare Wheel Carrier" },
  { id: "warranty", name: "Warranty" },
];

// ─── ACTUAL ITEM OPTIONS ──────────────────────────────────────────────────

const ACTUAL_ITEM_OPTIONS = [
  { id: "frame-assembly", name: "Frame Assembly" },
  { id: "chassis-frame", name: "Chassis Frame" },
  { id: "body-panels", name: "Body Panels" },
  { id: "hydraulic-kit", name: "Hydraulic Kit" },
  { id: "axle-assembly", name: "Axle Assembly" },
  { id: "suspension-kit", name: "Suspension Kit" },
  { id: "tyre-set", name: "Tyre Set" },
  { id: "rim-set", name: "Rim Set" },
  { id: "king-pin-set", name: "King Pin Set" },
  { id: "landing-leg-set", name: "Landing Leg Set" },
  { id: "brake-kit", name: "Brake Kit" },
  { id: "mudgaurd-set", name: "Mudgaurd Set" },
  { id: "paint-kit", name: "Paint Kit" },
  { id: "reflective-tapes", name: "Reflective Tapes" },
  { id: "supd-rupd-kit", name: "SUPD & RUPD Kit" },
  { id: "tool-box-kit", name: "Tool Box Kit" },
  { id: "spare-wheel-carrier", name: "Spare Wheel Carrier" },
  { id: "warranty-kit", name: "Warranty Kit" },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function CreateMaster() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [createMasterData, setCreateMasterData] = useState<CreateMasterItem[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  // ─── FORM STATE ──────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<{
    type: string;
    description: string;
    actualItem: MultiSelectOption[];
    exShowroom: string;
    effectiveDate: string;
  }>({
    type: "",
    description: "",
    actualItem: [],
    exShowroom: "",
    effectiveDate: "",
  });

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    fetchCreateMasterList();
  };

  const handleOpenAddDrawer = () => {
    setEditId(null);
    setFormData({
      type: "",
      description: "",
      actualItem: [],
      exShowroom: "",
      effectiveDate: "",
    });
    setShowDrawer(true);
  };

const formatDateForPicker = (date: any): string => {
  if (!date) return "";

  if (typeof date?.format === "function") {
    return date.format("DD-MM-YYYY");
  }

  if (date instanceof Date) {
    return dayjs(date).format("DD-MM-YYYY");
  }

  if (typeof date === "string") {
    // Backend: YYYY-MM-DD or ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.substring(0, 10).split("-");
      return `${day}-${month}-${year}`;
    }

    // Already DD-MM-YYYY
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

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
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
    setEditId(item.createMasterId);

    setFormData({
      type: item.type,
      description: item.description,
      actualItem: Array.isArray(item.actualItem) ? item.actualItem : [],
      exShowroom: String(item.exShowroom ?? ""),
      effectiveDate: formatDateForPicker(item.effectiveDate),
    });

    setShowDrawer(true);
  };

  const handleSave = async () => {
    try {
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

      if (!formData.exShowroom.trim()) {
        toasterrormsg("Ex-Showroom is required");
        return;
      }

      if (!formData.effectiveDate) {
        toasterrormsg("Effective Date is required");
        return;
      }

     const payload = {
  type: formData.type.trim(),
  description: formData.description.trim(),
  actualItem: formData.actualItem,
  exShowroom: Number(formData.exShowroom),
  effectiveDate: formatDateForApi(formData.effectiveDate),
  status: "active",
};

      setLoading(true);

      if (editId !== null) {
        await Put(
          "master/createmaster/update",
          {
            createMasterId: editId,
            ...payload,
          },
          false,
        );

        toastsuccessmsg("Create Master updated successfully");
      } else {
        await Post("master/createmaster/create", payload, false);

        toastsuccessmsg("Create Master created successfully");
      }

      setShowDrawer(false);

      setFormData({
        type: "",
        description: "",
        actualItem: [],
        exShowroom: "",
        effectiveDate: "",
      });

      setEditId(null);

      await fetchCreateMasterList();
    } catch (error: any) {
      console.error("Create Master save error:", error);

      toasterrormsg(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this record?",
      );

      if (!confirmed) return;

      setLoading(true);

      await Delete(
        "master/createmaster/delete",
        {
          createMasterId: id,
        },
        false,
      );

      toastsuccessmsg("Create Master deleted successfully");

      await fetchCreateMasterList();
    } catch (error: any) {
      console.error("Delete Create Master error:", error);

      toasterrormsg(
        error?.response?.data?.message || "Failed to delete Create Master",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateMasterList = async () => {
    try {
      setLoading(true);

      const response = await Get("master/createmaster/list", {}, false);

      if (response?.data?.status === 200 || response?.data?.success) {
        const data = response?.data?.data || [];

        setCreateMasterData(data);
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

  useEffect(() => {
    fetchCreateMasterList();
  }, []);

  // ─── FILTER & PAGINATION ──────────────────────────────────────────────────

  const filteredData = createMasterData.filter((item) => {
    const searchLower = search.toLowerCase();

    const actualItemStr = Array.isArray(item.actualItem)
      ? item.actualItem.map((i) => i.name).join(" ")
      : "";

    return (
      item.type.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      actualItemStr.toLowerCase().includes(searchLower) ||
      String(item.exShowroom).includes(search)
    );
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Create Master
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {/* Excel Export */}
          <button
            type="button"
            title="Export Excel"
            onClick={() => exportToExcel(currentItems, [], "createmaster")}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-black" />
            <span>Excel</span>
          </button>

          {/* PDF Export */}
          <button
            type="button"
            title="Export PDF"
            onClick={() =>
              exportToPdf(currentItems, [], "Create Master", "createmaster")
            }
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 text-black" />
            <span>PDF</span>
          </button>
          <Button
            color="primary"
            onClick={handleOpenAddDrawer}
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap"
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Type, Description, Actual Item..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12 text-center text-[11px]">SR NO</Th>
                <Th className="text-center text-[11px]">Type</Th>
                <Th className="text-center text-[11px]">Description</Th>
                <Th className="text-center text-[11px]">Actual Item</Th>
                <Th className="text-center text-[11px]">Ex-Showroom</Th>
                <Th className="text-center text-[11px]">Effective Date</Th>
                <Th className="w-20 text-center text-[11px]">Action</Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <Tr
                    key={item.createMasterId}
                    className="dark:hover:bg-dark-700/40 align-middle transition-colors hover:bg-gray-50/30"
                  >
                    <Td className="py-3 text-center text-[12px] font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-3 text-center text-[12px] font-medium text-gray-700 dark:text-gray-300">
                      {item.type}
                    </Td>
                    <Td className="py-3 text-center text-[12px] text-gray-600 dark:text-gray-400">
                      {item.description}
                    </Td>
                    <Td className="py-3 text-center text-[12px] text-gray-600 dark:text-gray-400">
                      {Array.isArray(item.actualItem)
                        ? item.actualItem.map((i: any) => i.name).join(", ")
                        : item.actualItem}
                    </Td>
                    <Td className="py-3 text-center text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      {item.exShowroom}
                    </Td>
                    <Td className="py-3 text-center text-[12px] text-gray-600 dark:text-gray-400">
                      {item.effectiveDate}
                    </Td>
                    <Td className="py-3 text-center">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
                          <EllipsisHorizontalIcon className="size-5" />
                        </MenuButton>
                        <MenuItems
                          anchor="bottom end"
                          className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                        >
                          <MenuItem>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => handleOpenEditDrawer(item)}
                                className={`${
                                  active
                                    ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                    : "dark:text-dark-200 text-gray-700"
                                } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                              >
                                <PencilSquareIcon className="size-4" />
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(item.createMasterId)
                                }
                                className={`${
                                  active
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                    : "dark:text-dark-200 text-gray-700"
                                } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                              >
                                <TrashIcon className="size-4" />
                                Delete
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No data available
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <div className="w-20">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="dark:border-dark-600 dark:bg-dark-700 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none dark:text-gray-200"
                >
                  {[10, 20, 30, 40, 50, 100].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <span>entries</span>
            </div>

            <div className="order-2 flex justify-center md:w-1/3">
              <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary-500 text-white"
                          : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Right Side Drawer */}
      <Transition appear show={showDrawer} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={() => setShowDrawer(false)}
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
                  handleSave();
                }}
                className="flex h-full flex-col"
              >
                <div className="bg-primary-600 dark:bg-primary-700 flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editId !== null ? "Edit Record" : "Add Record"}
                  </h2>
                  <button
                    onClick={() => setShowDrawer(false)}
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
                      data={TYPE_OPTIONS}
                      displayField="name"
                      value={
                        TYPE_OPTIONS.find(
                          (opt) => opt.name === formData.type,
                        ) || null
                      }
                      onChange={(selected: any) => {
                        setFormData({
                          ...formData,
                          type: selected?.name || "",
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
                      data={ACTUAL_ITEM_OPTIONS}
                      displayField="name"
                      value={formData.actualItem}
                      onChange={(selected: any) => {
                        setFormData({
                          ...formData,
                          actualItem: selected,
                        });
                      }}
                      placeholder="Select Actual Items..."
                      searchFields={["name"]}
                    />
                  </div>
                  {/* Ex-Showroom */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ex-Showroom <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter ex-showroom price"
                      value={formData.exShowroom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exShowroom: e.target.value,
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
  value={getDatePickerValue(formData.effectiveDate)}
  onChange={handleEffectiveDateChange}
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
                    onClick={() => setShowDrawer(false)}
                    className="h-10 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" className="h-10 w-1/2">
                    {editId !== null ? "Update" : "Save"}
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
