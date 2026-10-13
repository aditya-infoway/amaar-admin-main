import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { SERIAL_OPTIONS, type ItemCategory, type ProcessRow } from "./data";

type Mode = "add" | "edit" | "view";

interface Props {
  isOpen: boolean;
  close: () => void;
  itemCategory: ItemCategory | null;
  mode: Mode;
  onSave: () => void;
}

interface Option {
  id: string;
  label: string;
}

export function ItemCategoryDrawer({
  isOpen,
  close,
  itemCategory,
  mode,
  onSave,
}: Props) {
  const isView = mode === "view";
  const isEditing = mode === "edit" && Boolean(itemCategory?.id);

  const [mainProcess, setMainProcess] = useState("");
  const [processes, setProcesses] = useState<ProcessRow[]>([]);

  // row-level draft (code + name + serial -> check button)
  const [processCode, setProcessCode] = useState("");
  const [processName, setProcessName] = useState("");
  const [selectedSerial, setSelectedSerial] = useState<Option[]>([]);

  // table ki kaunsi row edit ho rahi hai (null = nayi row add mode)
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetDraft = () => {
    setProcessCode("");
    setProcessName("");
    setSelectedSerial([]);
    setEditIndex(null);
  };

  // Prefill on edit/view, reset on add
  useEffect(() => {
    if (!isOpen) return;

    if (itemCategory?.id) {
      setMainProcess(itemCategory.mainProcess || "");
      setProcesses(itemCategory.processes || []);
    } else {
      setMainProcess("");
      setProcesses([]);
    }
    resetDraft();
    setErrors({});
  }, [isOpen, itemCategory]);

  // table row ka edit icon
  const handleEditProcess = (index: number) => {
    const row = processes[index];
    if (!row) return;

    setProcessCode(row.processCode);
    setProcessName(row.processName);
    setSelectedSerial([
      { id: String(row.serialNo), label: String(row.serialNo) },
    ]);
    setEditIndex(index);
    setErrors({});
  };

  const handleCancelEdit = () => {
    resetDraft();
    setErrors({});
  };

  // ✓ button — add ya update (editIndex ke hisaab se)
  const handleAddProcess = () => {
    const next: Record<string, string> = {};
    const code = processCode.trim();
    const name = processName.trim();

    if (!code) next.processCode = "Enter Process Code";
    if (!name) next.processName = "Enter Process Name";
    if (!selectedSerial[0]) next.serialNo = "Select Serial No";

    // edit me apni row ko chhod kar baaki rows se compare
    const others = processes.filter((_, i) => i !== editIndex);

    if (
      code &&
      others.some((p) => p.processCode.toLowerCase() === code.toLowerCase())
    ) {
      next.processCode = "Process Code already added";
    }

    if (selectedSerial[0]) {
      const used = new Set(others.map((p) => Number(p.serialNo)));
      let expected = 1;
      while (used.has(expected)) expected++;

      const picked = Number(selectedSerial[0].id);

      if (used.has(picked)) {
        next.serialNo = "Serial No already used";
      } else if (picked > expected) {
        next.serialNo = `Serial No ${expected} is pending. Add it first.`;
      }
    }

    if (Object.keys(next).length > 0) {
      setErrors((prev) => ({ ...prev, ...next }));
      return;
    }

    const serialNo = Number(selectedSerial[0].id);

    if (editIndex !== null) {
      // same row update (id preserve hota hai)
      setProcesses((prev) =>
        prev
          .map((p, i) =>
            i === editIndex
              ? { ...p, processCode: code, processName: name, serialNo }
              : p,
          )
          .sort((a, b) => a.serialNo - b.serialNo),
      );
    } else {
      setProcesses((prev) =>
        [...prev, { processCode: code, processName: name, serialNo }].sort(
          (a, b) => a.serialNo - b.serialNo,
        ),
      );
    }

    resetDraft();
    setErrors((prev) => {
      const { processCode, processName, serialNo, processes: _p, ...rest } = prev;
      return rest;
    });
  };

  const handleRemoveProcess = (index: number) => {
    setProcesses((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, serialNo: i + 1 })),
    );
    // edit chal raha tha to index shift ho jaata hai, isliye draft reset
    resetDraft();
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!mainProcess.trim()) next.mainProcess = "Enter Main Process";

    if (editIndex !== null) {
      next.processes = "Click the ✓ button to update the process first";
    } else if (processCode.trim() || processName.trim() || selectedSerial[0]) {
      next.processes = "Click the ✓ button to add the process to the table";
    } else if (processes.length === 0) {
      next.processes = "Add at least one process";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return;
    }

    const companyId = localStorage.getItem("companyId");

    const payload = {
      financialYearId: Number(financialYearId),
      mainProcess: mainProcess.trim(),
      processes: processes.map((p) => ({
        ...(p.id ? { id: p.id } : {}),
        processCode: p.processCode,
        processName: p.processName,
        serialNo: p.serialNo,
      })),
      // sirf create pe bhejna hai, edit pe original creator overwrite nahi hona chahiye
      ...(!isEditing && {
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      }),
    };

    try {
      const response =
        isEditing && itemCategory?.id
          ? await Put(`main-process/${itemCategory.id}`, payload, false)
          : await Post("main-process/create", payload, false);

      const res = response?.data;

      if (res?.success || res?.status === 200) {
        toastsuccessmsg(
          res?.message ||
            (isEditing ? "Updated successfully" : "Saved successfully"),
        );
        onSave();
        close();
      } else {
        toasterrormsg(res?.message || "Failed to save.");
      }
    } catch (error: any) {
      console.error("Main process save error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving.",
      );
    }
  };

  const title = isView
    ? "View production Process"
    : isEditing
      ? "Edit production Process"
      : "Add production Process";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-3xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
          {/* Header */}
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
              {/* Main Process */}
              <Input
                label="Main Process"
                placeholder="Enter main process"
                value={mainProcess}
                disabled={isView}
                error={errors.mainProcess}
                onChange={(e: any) => setMainProcess(e.target.value)}
              />

              {/* Process row: code | name | serial | ✓ (| ✗ edit cancel) */}
              {!isView && (
                <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
                  <Input
                    label="Process Code"
                    placeholder="Code"
                    value={processCode}
                    error={errors.processCode}
                    onChange={(e: any) => setProcessCode(e.target.value)}
                  />
                  <Input
                    label="Process Name"
                    placeholder="Name"
                    value={processName}
                    error={errors.processName}
                    onChange={(e: any) => setProcessName(e.target.value)}
                  />
                  <div>
                    <Combobox
                      data={SERIAL_OPTIONS}
                      displayField="label"
                      value={selectedSerial[0] ?? null}
                      onChange={(val: any) =>
                        setSelectedSerial(
                          val ? (Array.isArray(val) ? val : [val]) : [],
                        )
                      }
                      placeholder="Serial"
                      label="Serial No"
                      searchFields={["label"]}
                    />
                    {errors.serialNo && (
                      <p className="text-error mt-1 text-xs">
                        {errors.serialNo}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:pt-6">
                    <Button
                      type="button"
                      color="primary"
                      isIcon
                      onClick={handleAddProcess}
                      className="size-9 rounded-full"
                      title={editIndex !== null ? "Update process" : "Add process"}
                    >
                      <CheckIcon className="size-5" />
                    </Button>
                    {editIndex !== null && (
                      <Button
                        type="button"
                        isIcon
                        onClick={handleCancelEdit}
                        className="size-9 rounded-full"
                        title="Cancel edit"
                      >
                        <XMarkIcon className="size-5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Added processes table */}
              <div>
                <div className="dark:border-dark-500 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="dark:bg-dark-600 bg-gray-100">
                      <tr>
                        <th className="px-3 py-2">Sr.</th>
                        <th className="px-3 py-2">Process Code</th>
                        <th className="px-3 py-2">Process Name</th>
                        <th className="px-3 py-2">Serial No</th>
                        {!isView && <th className="px-3 py-2">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {processes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isView ? 4 : 5}
                            className="px-3 py-4 text-center text-gray-500"
                          >
                            No process added yet.
                          </td>
                        </tr>
                      ) : (
                        processes.map((p, i) => (
                          <tr
                            key={`${p.processCode}-${i}`}
                            className={`dark:border-dark-500 border-t border-gray-200 ${
                              editIndex === i ? "bg-primary-600/10" : ""
                            }`}
                          >
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">{p.processCode}</td>
                            <td className="px-3 py-2">{p.processName}</td>
                            <td className="px-3 py-2">{p.serialNo}</td>
                            {!isView && (
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    title="Edit"
                                    onClick={() => handleEditProcess(i)}
                                    className="text-primary-600 hover:opacity-80"
                                  >
                                    <PencilSquareIcon className="size-4.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Remove"
                                    onClick={() => handleRemoveProcess(i)}
                                    className="text-error hover:opacity-80"
                                  >
                                    <TrashIcon className="size-4.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {errors.processes && (
                  <p className="text-error mt-1 text-xs">{errors.processes}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <Button type="button" onClick={close}>
                {isView ? "Close" : "Cancel"}
              </Button>
              {!isView && (
                <Button type="button" color="primary" onClick={handleSubmit}>
                  {isEditing ? "Update" : "Submit"}
                </Button>
              )}
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}