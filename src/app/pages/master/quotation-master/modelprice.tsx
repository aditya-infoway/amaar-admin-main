import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  PencilSquareIcon,
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
import { Button, Input } from "@/components/ui";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { MasterToolbar } from "../shared/MasterToolbar";
import { MasterTable } from "../shared/MasterTable";
import dayjs from "dayjs";
import {
  Get,
  Post,
  Put,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
  formatDateDDMMYYYY,
} from "@/ApiHelper";
import { columns, exportColumns, ModelPriceItem } from "./modelpricecolumns";
import { exportToExcel, exportToPdf } from "../shared/export";

const BASE = "master/quotation-master/modelprice";

const typeOptions = [
  { id: 1, name: "BOM" },
  { id: 2, name: "Manual" },
  { id: 3, name: "Quotation" },
];

export default function ModelPrice() {
  const [data, setData] = useState<ModelPriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // dropdown data from API
  const [finishedGoodsOptions, setFinishedGoodsOptions] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any[]>([]);

  // form state
  const [selectedModel, setSelectedModel] = useState<any[]>([]);
  const [modelData, setModelData] = useState<any>({
    modelPriceId: null,
    finishedGoodsItemId: null,
    modelName: "",
    currentDate: dayjs().format("YYYY-MM-DD"),
    components: [],
    totalValue: 0,
    status: "active",
  });

  const [currentRow, setCurrentRow] = useState<any>({
    id: "",
    itemId: null,
    item: "",
    type: "",
    groupId: null,
    subGroupId: null,
    group: "",
    weight: "",
    rate: "",
    value: "",
  });

  const latest = useRef<{ currentRow: any; modelData: any }>({
    currentRow: null,
    modelData: null,
  });
  latest.current.currentRow = currentRow;
  latest.current.modelData = modelData;

  const pickFirst = (v: any) => (Array.isArray(v) ? v[0] : v);

  // ─── LOAD LIST ───────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Get(`${BASE}/list`, {}, false);
      if (res?.data?.status === 200 || res?.data?.success) {
        const rows = (res.data.data || []).map((r: any) => ({
          id: String(r.modelPriceId),
          modelPriceId: r.modelPriceId,
          modelName: r.modelName || r.itemName || "",
          itemCode: r.itemCode || "",
          currentDate: r.currentDate,
          totalValue: r.totalValue,
          status: r.status,
          componentCount: r.componentCount ?? 0,
          types: r.types || [],
          components: [],
        }));
        setData(rows);
      }
    } catch (e: any) {
      toasterrormsg(e?.response?.data?.message || "Failed to load list");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── LOAD DROPDOWNS ──────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    try {
      const [fgRes, itemRes, groupRes] = await Promise.all([
        Get(`${BASE}/finished-goods`, {}, false),
        Get(`${BASE}/items`, {}, false),
        Get(`${BASE}/groups`, {}, false),
      ]);

      if (fgRes?.data?.data) {
        setFinishedGoodsOptions(
          (fgRes.data.data || []).map((r: any) => ({
            id: r.itemId,
            name: r.label || `${r.itemCode} - ${r.itemName}`,
            itemId: r.itemId,
            itemCode: r.itemCode,
            itemName: r.itemName,
          })),
        );
      }

      if (itemRes?.data?.data) {
        setItemOptions(
          (itemRes.data.data || []).map((r: any) => ({
            id: r.createMasterId,
            name: r.label || r.description || r.code,
            createMasterId: r.createMasterId,
            description: r.description,
            code: r.code,
            totalWeight: r.totalWeight,
          })),
        );
      }

      if (groupRes?.data?.data) {
        setGroupOptions(
          (groupRes.data.data || []).map((r: any) => ({
            id: r.id,
            name: r.label,
            groupId: r.groupId,
            subGroupId: r.subGroupId,
          })),
        );
      }
    } catch (e: any) {
      toasterrormsg(e?.response?.data?.message || "Failed to load dropdowns");
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchDropdowns();
  }, [fetchList, fetchDropdowns]);

  // ─── AUTO FETCH WEIGHT / RATE ────────────────────────────────────────────
  const fetchAutoValues = async (
    type: string,
    createMasterId: number | null,
    finishedGoodsItemId: number | null,
    groupId: number | null = null,
    subGroupId: number | null = null,
  ) => {
    if (!type || !createMasterId) return { weight: "", rate: "" };
    if (type === "Manual") return { weight: "", rate: "" };

    if (type === "BOM") {
      if (!finishedGoodsItemId) {
        toasterrormsg("Please select Finished Goods first.");
        return { weight: "", rate: "" };
      }
      if (!groupId) return { weight: "", rate: "" };
    }

    try {
      const params: any = { type, createMasterId };
      if (type === "BOM") {
        params.finishedGoodsItemId = finishedGoodsItemId;
        params.groupId = groupId;
        if (subGroupId) params.subGroupId = subGroupId;
      }

      const res = await Get(`${BASE}/auto-fetch`, params, false);

      if (res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Auto fetch failed");
        return { weight: "", rate: "" };
      }

      const d = res?.data?.data;
      if (d) {
        if (d.weight == null && d.rate == null && res?.data?.message) {
          toasterrormsg(res.data.message);
        }
        return {
          weight: d.weight != null ? String(d.weight) : "",
          rate: d.rate != null ? String(d.rate) : "",
        };
      }
    } catch (e: any) {
      toasterrormsg(e?.response?.data?.message || "Auto fetch failed");
    }
    return { weight: "", rate: "" };
  };

  const handleTypeChange = async (selectedVal: any) => {
    const typeName = selectedVal?.name || "";

    setCurrentRow((prev: any) => ({
      ...prev,
      type: typeName,
      group: "",
      groupId: null,
      subGroupId: null,
      weight: "",
      rate: "",
    }));
    setSelectedGroup([]);

    const { currentRow: cr, modelData: md } = latest.current;

    // BOM: weight comes only after Group is selected
    // Manual: user types both
    if (!typeName || typeName === "Manual" || typeName === "BOM") return;
    if (!cr.itemId) return;

    const auto = await fetchAutoValues(
      typeName,
      cr.itemId,
      md.finishedGoodsItemId,
    );

    setCurrentRow((prev: any) => ({
      ...prev,
      weight: auto.weight,
      rate: auto.rate,
    }));
  };

  const handleItemChange = async (selectedVal: any) => {
    setSelectedItem(selectedVal ?? []);

    const selected = pickFirst(selectedVal);
    if (!selected) {
      setCurrentRow((prev: any) => ({
        ...prev,
        itemId: null,
        item: "",
        weight: "",
        rate: "",
      }));
      return;
    }

    setCurrentRow((prev: any) => ({
      ...prev,
      itemId: selected.createMasterId,
      item: selected.name,
    }));

    const { currentRow: cr, modelData: md } = latest.current;

    // BOM weight depends on Group, not on Item
    if (!cr.type || cr.type === "Manual" || cr.type === "BOM") return;

    const auto = await fetchAutoValues(
      cr.type,
      selected.createMasterId,
      md.finishedGoodsItemId,
    );

    setCurrentRow((prev: any) => ({
      ...prev,
      weight: auto.weight,
      rate: auto.rate,
    }));
  };

  // ─── EFFECTS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const first = pickFirst(selectedModel);
    setModelData((prev: any) => ({
      ...prev,
      finishedGoodsItemId: first ? (first.itemId ?? first.id ?? null) : null,
      modelName: first ? first.name : "",
    }));
  }, [selectedModel]);

  useEffect(() => {
    const w = parseFloat(currentRow.weight) || 0;
    const r = parseFloat(currentRow.rate) || 0;
    const calculatedValue = (w * r).toFixed(2);
    setCurrentRow((prev: any) => ({
      ...prev,
      value: calculatedValue === "0.00" ? "" : calculatedValue,
    }));
  }, [currentRow.weight, currentRow.rate]);

  const handleFinishedGoodsChange = (selectedVal: any) => {
    setSelectedModel(selectedVal ?? []);
  };

  const handleOpenEdit = async (rowArg: any) => {
    const item = rowArg?.original ?? rowArg;
    const id = item?.modelPriceId || Number(item?.id);
    if (!id) return toasterrormsg("Invalid record.");

    try {
      const res = await Get(`${BASE}/${id}`, {}, false);
      if (res?.data?.success === false || res?.data?.status === 400) {
        return toasterrormsg(
          res?.data?.message || "Failed to load Model Price",
        );
      }
      const d = res?.data?.data;
      if (!d) return toasterrormsg("Model Price not found");

      setModelData({
        modelPriceId: d.modelPriceId,
        finishedGoodsItemId: d.finishedGoodsItemId,
        modelName: d.modelName || "",
        currentDate: dayjs(d.currentDate).format("YYYY-MM-DD"),
        totalValue: d.totalValue,
        status: d.status || "active",
        components: (d.components || []).map((c: any) => ({
          id: String(c.modelPriceItemId),
          itemId: c.itemId,
          item: c.itemDescription || c.itemCode || "",
          type: c.type,
          groupId: c.groupId,
          subGroupId: c.subGroupId,
          group: c.subGroupName || c.groupName || "",
          weight: c.weight != null ? String(c.weight) : "",
          rate: c.rate != null ? String(c.rate) : "",
          value: c.value != null ? String(c.value) : "",
        })),
      });

      const fg = finishedGoodsOptions.find(
        (o) => Number(o.itemId) === Number(d.finishedGoodsItemId),
      );
      setSelectedModel(fg ?? []);
      resetCurrentRow();
      setDrawerOpen(true);
    } catch (e: any) {
      toasterrormsg(e?.response?.data?.message || "Failed to load Model Price");
    }
  };

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setModelData({
      modelPriceId: null,
      finishedGoodsItemId: null,
      modelName: "",
      currentDate: dayjs().format("YYYY-MM-DD"),
      components: [],
      totalValue: 0,
      status: "active",
    });
    setSelectedModel([]);
    resetCurrentRow();
    setDrawerOpen(true);
  };

  const resetCurrentRow = () => {
    setSelectedItem([]);
    setSelectedGroup([]);
    setCurrentRow({
      id: "",
      itemId: null,
      item: "",
      type: "",
      groupId: null,
      subGroupId: null,
      group: "",
      weight: "",
      rate: "",
      value: "",
    });
  };

  const handleGroupChange = async (selectedVal: any) => {
    setSelectedGroup(selectedVal ?? []);

    const selected = pickFirst(selectedVal);
    if (!selected) {
      setCurrentRow((prev: any) => ({
        ...prev,
        group: "",
        groupId: null,
        subGroupId: null,
        weight: "",
      }));
      return;
    }

    const gId = selected.groupId || null;
    const sgId = selected.subGroupId || null;

    setCurrentRow((prev: any) => ({
      ...prev,
      group: selected.name,
      groupId: gId,
      subGroupId: sgId,
      weight: "",
    }));

    const { currentRow: cr, modelData: md } = latest.current;
    if (cr.type !== "BOM") return;

    const auto = await fetchAutoValues(
      "BOM",
      cr.itemId ?? 0,
      md.finishedGoodsItemId,
      gId,
      sgId,
    );

    setCurrentRow((prev: any) => ({ ...prev, weight: auto.weight }));
  };

  const handleAddRowToGrid = () => {
    if (!currentRow.itemId) return toasterrormsg("Please select an Item.");
    if (!currentRow.type) return toasterrormsg("Please select a Type.");
    if (currentRow.type === "BOM" && !currentRow.groupId)
      return toasterrormsg("Please select a Group.");
    if (!currentRow.weight) return toasterrormsg("Weight is required.");
    if (!currentRow.rate) return toasterrormsg("Rate is required.");

    const newComponent = {
      ...currentRow,
      id: Date.now().toString(),
    };
    setModelData((prev: any) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    resetCurrentRow();
  };

  const handleRemoveGridRow = (id: string) => {
    setModelData((prev: any) => ({
      ...prev,
      components: prev.components.filter((c: any) => c.id !== id),
    }));
  };

  const handleEditGridRow = (comp: any) => {
    const itemOpt = itemOptions.find(
      (o) => Number(o.createMasterId) === Number(comp.itemId),
    ) ?? { id: comp.itemId, createMasterId: comp.itemId, name: comp.item };

    const groupOpt = comp.groupId
      ? groupOptions.find(
          (o) =>
            Number(o.groupId) === Number(comp.groupId) &&
            Number(o.subGroupId || 0) === Number(comp.subGroupId || 0),
        )
      : null;

    setSelectedItem(itemOpt);
    setSelectedGroup(groupOpt ?? []);
    setCurrentRow({ ...comp });

    setModelData((prev: any) => ({
      ...prev,
      components: prev.components.filter((c: any) => c.id !== comp.id),
    }));
  };

  const handleSaveModel = async () => {
    if (!modelData.finishedGoodsItemId)
      return toasterrormsg("Please select Finished Goods.");
    if (modelData.components.length === 0)
      return toasterrormsg("Please add at least one component.");

    setSaving(true);
    try {
      const payload = {
        finishedGoodsItemId: modelData.finishedGoodsItemId,
        modelName: modelData.modelName,
        currentDate: modelData.currentDate,
        status: modelData.status || "active",
        items: modelData.components.map((c: any) => ({
          itemId: c.itemId,
          type: c.type,
          groupId: c.type === "BOM" ? c.groupId : null,
          subGroupId: c.type === "BOM" ? c.subGroupId : null,
          weight: c.weight,
          rate: c.rate,
          value: c.value,
        })),
      };

      let res;
      if (modelData.modelPriceId) {
        res = await Put(
          `${BASE}/update`,
          { ...payload, modelPriceId: modelData.modelPriceId },
          false,
        );
      } else {
        res = await Post(`${BASE}/create`, payload, false);
      }

      if (res?.data?.status === 200 || res?.data?.success) {
        toastsuccessmsg(
          modelData.modelPriceId
            ? "Model Price updated successfully!"
            : "Model Price saved successfully!",
        );
        setDrawerOpen(false);
        fetchList();
      } else {
        toasterrormsg(res?.data?.message || "Save failed");
      }
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.message || e?.message || "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModel = async (rowArg: any) => {
    const row = rowArg?.original ?? rowArg;
    try {
      const res = await Delete(
        `${BASE}/delete`,
        { modelPriceId: row.modelPriceId || Number(row.id) },
        false,
      );
      if (res?.data?.status === 200 || res?.data?.success) {
        toastsuccessmsg("Model deleted.");
        fetchList();
      } else {
        toasterrormsg(res?.data?.message || "Delete failed");
      }
    } catch (e: any) {
      toasterrormsg(e?.response?.data?.message || "Delete failed");
    }
  };

  const buildExportData = () => {
    const selected = table.getSelectedRowModel().rows;
    const rows = selected.length ? selected : table.getFilteredRowModel().rows;

    return rows.map((r) => {
      const o = r.original;
      return {
        ...o,
        currentDate: formatDateDDMMYYYY(o.currentDate),
        typesText: (o.types || []).join(", "),
        totalValue: Number(o.totalValue || 0).toFixed(2),
      } as any;
    });
  };

  const handleExportExcel = () => {
    const exportData = buildExportData();
    if (!exportData.length) return toasterrormsg("No data to export.");
    exportToExcel(exportData, exportColumns, "modelprice");
  };

  const handleExportPdf = () => {
    const exportData = buildExportData();
    if (!exportData.length) return toasterrormsg("No data to export.");
    exportToPdf(exportData, exportColumns, "Model Price List", "modelprice");
  };

  // ─── TABLE ───────────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: { deleteRow: handleDeleteModel, openEditDrawer: handleOpenEdit },
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
        title="Model Price"
        createLabel="Add Model Price"
        searchPlaceholder="Search by Model..."
        table={table}
        showFilters={false}
        onToggleFilters={() => {}}
        onCreate={handleOpenCreate}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />

      <MasterTable
        table={table}
        columnCount={columns.length}
        emptyMessage={
          loading
            ? "Loading..."
            : "No models found. Click Add Model Price to create one."
        }
      />

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
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-350 transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <div className="bg-primary-600 dark:bg-primary-700 flex items-center justify-between px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  {modelData.modelPriceId
                    ? "Edit Model Price"
                    : "Create Model Price"}
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  type="button"
                  className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grow space-y-6 overflow-y-auto p-6">
                {/* Header */}
                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <Combobox
                      data={finishedGoodsOptions}
                      displayField="name"
                      value={selectedModel}
                      onChange={handleFinishedGoodsChange}
                      placeholder="Please Select Finished Goods"
                      label="Select Finished Goods"
                      searchFields={["name"]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      placeholder="DD-MM-YYYY"
                      options={{ dateFormat: "d-m-Y" }}
                      value={[dayjs(modelData.currentDate).toDate()]}
                      onChange={(dates: any) =>
                        setModelData({
                          ...modelData,
                          currentDate: dates?.[0]
                            ? dayjs(dates[0]).format("YYYY-MM-DD")
                            : dayjs().format("YYYY-MM-DD"),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Row entry */}
                <div className="grid grid-cols-12 items-end gap-3">
                  <div className="col-span-3">
                    <Combobox
                      data={itemOptions}
                      displayField="name"
                      value={selectedItem}
                      onChange={handleItemChange}
                      placeholder="Select Item"
                      label="Select Item"
                      searchFields={["name"]}
                    />
                  </div>

                  <div className="col-span-2">
                    <Listbox
                      key={`type-${currentRow.type}`}
                      data={typeOptions}
                      displayField="name"
                      value={
                        typeOptions.find((t) => t.name === currentRow.type) ||
                        null
                      }
                      onChange={handleTypeChange}
                      placeholder="Select Type"
                      label="Type"
                    />
                  </div>

                  <div className="col-span-2">
                    <div
                      className={
                        currentRow.type !== "BOM"
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    >
                      <Combobox
                        data={groupOptions}
                        displayField="name"
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        placeholder="Select Group"
                        label="Group"
                        searchFields={["name"]}
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-gray-500">
                      Weight
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={currentRow.weight}
                      disabled={
                        currentRow.type === "Quotation" ||
                        currentRow.type === "BOM"
                      }
                      onChange={(e) =>
                        setCurrentRow({
                          ...currentRow,
                          weight: e.target.value,
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="mb-1 block text-xs text-gray-500">
                      Rate
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={currentRow.rate}
                      disabled={currentRow.type === "Quotation"}
                      onChange={(e) =>
                        setCurrentRow({
                          ...currentRow,
                          rate: e.target.value,
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-gray-500">
                      Value
                    </label>
                    <Input
                      type="text"
                      value={currentRow.value}
                      readOnly
                      className="dark:bg-dark-900 w-full bg-gray-100 text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      color="primary"
                      onClick={handleAddRowToGrid}
                      className="flex h-[38px] w-full items-center justify-center"
                      title="Add Row"
                    >
                      <CheckIcon className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Grid */}
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="dark:bg-dark-800 bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 font-medium">Item</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Group</th>
                        <th className="px-4 py-2 font-medium">Weight</th>
                        <th className="px-4 py-2 font-medium">Rate</th>
                        <th className="px-4 py-2 font-medium">Value</th>
                        <th className="px-4 py-2 text-center font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {modelData.components.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No components added yet.
                          </td>
                        </tr>
                      ) : (
                        modelData.components.map((comp: any) => (
                          <tr
                            key={comp.id}
                            className="dark:hover:bg-dark-800/50 hover:bg-gray-50"
                          >
                            <td className="px-4 py-2">{comp.item}</td>
                            <td className="px-4 py-2">{comp.type}</td>
                            <td className="px-4 py-2">{comp.group || "-"}</td>
                            <td className="px-4 py-2">{comp.weight}</td>
                            <td className="px-4 py-2">{comp.rate}</td>
                            <td className="px-4 py-2 font-medium">
                              {comp.value}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleEditGridRow(comp)}
                                className="text-primary-500 hover:text-primary-700 mr-3 cursor-pointer"
                                title="Edit row"
                              >
                                <PencilSquareIcon className="inline size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGridRow(comp.id)}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                                title="Delete row"
                              >
                                <TrashIcon className="inline size-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">
                <Button
                  variant="outlined"
                  color="neutral"
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-10 w-32"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleSaveModel}
                  disabled={saving}
                  className="h-10 w-36"
                >
                  {saving
                    ? modelData.modelPriceId
                      ? "Updating..."
                      : "Saving..."
                    : modelData.modelPriceId
                      ? "Update Model"
                      : "Save Model"}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
