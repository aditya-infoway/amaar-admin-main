import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { SERIAL_OPTIONS, type SubProcess } from "./data";

type Mode = "add" | "edit" | "view";

interface Props {
  isOpen: boolean;
  close: () => void;
  subProcess: SubProcess | null;
  mode: Mode;
  onSave: () => void;
}

interface Option {
  id: string;
  label: string;
}

export function SubProcessDrawer({
  isOpen,
  close,
  subProcess,
  mode,
  onSave,
}: Props) {
  const isView = mode === "view";
  const isEditing = mode === "edit" && Boolean(subProcess?.id);

  const [processOptions, setProcessOptions] = useState<Option[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Option[]>([]);
  const [subProcessName, setSubProcessName] = useState("");
  const [subProcessCode, setSubProcessCode] = useState("");
  const [selectedSerial, setSelectedSerial] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Drawer khulte hi saare processes fetch karo
  useEffect(() => {
    if (!isOpen) return;

    const fetchProcesses = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        // main process wali list API (jo prefix main page me use ho raha hai wahi rakho)
        const response = await Get(
          "main-process/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
                  const list: any[] = response.data.data || [];
          setProcessOptions(
            list
              .filter((m) => m.status === "Active")
              .flatMap((m) =>
                (m.processes || []).map((p: any) => ({
                  id: String(p.id),
                  label: `${p.processName}`,
                })),
              ),
          );
        }
      } catch (error) {
        console.error("Process list error:", error);
        toasterrormsg("Unable to load processes.");
      }
    };

    fetchProcesses();
  }, [isOpen]);

  // Prefill (edit/view) ya reset (add)
  useEffect(() => {
    if (!isOpen) return;

    if (subProcess?.id) {
      setSubProcessName(subProcess.subProcessName || "");
      setSubProcessCode(subProcess.subProcessCode || "");
      setSelectedSerial(
        subProcess.serialNo
          ? [
              {
                id: String(subProcess.serialNo),
                label: String(subProcess.serialNo),
              },
            ]
          : [],
      );
    } else {
      setSubProcessName("");
      setSubProcessCode("");
      setSelectedSerial([]);
      setSelectedProcess([]);
    }
    setErrors({});
  }, [isOpen, subProcess]);

  // Process options aane ke baad edit ka selected process set karo
  useEffect(() => {
    if (!isOpen || !subProcess?.id) return;
    const found = processOptions.find(
      (o) => o.id === String(subProcess.processId),
    );
    setSelectedProcess(found ? [found] : []);
  }, [isOpen, subProcess, processOptions]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selectedProcess[0]) next.process = "Select a Process";
    if (!subProcessName.trim()) next.subProcessName = "Enter Sub Process Name";
    if (!subProcessCode.trim()) next.subProcessCode = "Enter Sub Process Code";
    if (!selectedSerial[0]) next.serialNo = "Select Serial No";
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
      processId: Number(selectedProcess[0].id),
      subProcessName: subProcessName.trim(),
      subProcessCode: subProcessCode.trim(),
      serialNo: Number(selectedSerial[0].id),
      ...(!isEditing && {
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      }),
    };

    try {
      const response =
        isEditing && subProcess?.id
          ? await Put(`sub-process/${subProcess.id}`, payload, false)
          : await Post("sub-process/create", payload, false);

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
      console.error("Sub process save error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving.",
      );
    }
  };

  const title = isView
    ? "View Sub Process"
    : isEditing
      ? "Edit Sub Process"
      : "Add Sub Process";

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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
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
              <div>
                <Combobox
                  data={processOptions}
                  displayField="label"
                  value={selectedProcess[0] ?? null}
                  onChange={(val: any) =>
                    setSelectedProcess(
                      val ? (Array.isArray(val) ? val : [val]) : [],
                    )
                  }
                  placeholder="Select Process"
                  label="Select Process"
                  searchFields={["label"]}
                  inputProps={{ disabled: isView }}
                />
                {errors.process && (
                  <p className="text-error mt-1 text-xs">{errors.process}</p>
                )}
              </div>

              <Input
                label="Sub Process Name"
                placeholder="Enter sub process name"
                value={subProcessName}
                disabled={isView}
                error={errors.subProcessName}
                onChange={(e: any) => setSubProcessName(e.target.value)}
              />

              <Input
                label="Sub Process Code"
                placeholder="Enter sub process code"
                value={subProcessCode}
                disabled={isView}
                error={errors.subProcessCode}
                onChange={(e: any) => setSubProcessCode(e.target.value)}
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
                  placeholder="Select Serial No"
                  label="Serial No"
                  searchFields={["label"]}
                  inputProps={{ disabled: isView }}
                />
                {errors.serialNo && (
                  <p className="text-error mt-1 text-xs">{errors.serialNo}</p>
                )}
              </div>
            </div>

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