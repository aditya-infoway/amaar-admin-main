import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import type { WorkOrder } from "../shared/types";

interface Props {
  isOpen: boolean;
  close: () => void;
  workOrder: WorkOrder | null;
  onSave: () => void;
}

interface Option {
  id: string;
  label: string;
}

interface ContractorRow extends Option {
  employeeId: number;
  processId: string;
  processName: string;
  subProcessId: string;
  subProcessName: string;
}

const toStr = (v: any) =>
  v === undefined || v === null || v === 0 || v === "0" ? "" : String(v);

export default function AssignWorkOrderDrawer({
  isOpen,
  close,
  workOrder,
  onSave,
}: Props) {
  const [contractors, setContractors] = useState<ContractorRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
const [assigned, setAssigned] = useState<
  { processId: string; subProcessId: string }[]
>([]);
  const [selectedProcess, setSelectedProcess] = useState<Option | null>(null);
  const [selectedSubProcess, setSelectedSubProcess] = useState<Option | null>(
    null,
  );
  const [selectedContractor, setSelectedContractor] =
    useState<ContractorRow | null>(null);
  const [contractAmount, setContractAmount] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Drawer khulte hi form reset + data fetch
useEffect(() => {
  if (!isOpen) return;

  setSelectedProcess(null);
  setSelectedSubProcess(null);
  setSelectedContractor(null);
  setContractAmount("");
  setErrors({});
  setAssigned([]);

  let isMounted = true;

  const load = async () => {
    setDataLoading(true);
    try {
      const [res, assignedRes] = await Promise.all([
        Get("master/employee/assignable-contractors", {}, false).catch(
          () => null,
        ),
        workOrder?.id
          ? Get(
              "workorder/assigned-processes",
              { workOrderId: workOrder.id },
              false,
            ).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (!isMounted) return;

      if (res?.data?.success) {
        setContractors(
          (res.data.data || []).map((e: any) => ({
            id: String(e.employeeId),
            label: e.employeeName,
            employeeId: Number(e.employeeId),
            processId: toStr(e.processId),
            processName: e.processName || "",
            subProcessId: toStr(e.subProcessId),
            subProcessName: e.subProcessName || "",
          })),
        );
      }

      if (assignedRes?.data?.success) {
        setAssigned(
          (assignedRes.data.data || []).map((a: any) => ({
            processId: String(a.processId),
            subProcessId: toStr(a.subProcessId),
          })),
        );
      }
    } finally {
      if (isMounted) setDataLoading(false);
    }
  };

  load();
  return () => {
    isMounted = false;
  };
}, [isOpen, workOrder?.id]);

// Assigned (process|subProcess) ka set
const assignedKeys = useMemo(
  () => new Set(assigned.map((a) => `${a.processId}|${a.subProcessId}`)),
  [assigned],
);

// Process tab dikhega jab usme koi slot baaki ho
const processes = useMemo<Option[]>(() => {
  const subsByProcess = new Map<string, Set<string>>();
  const names = new Map<string, string>();

  contractors.forEach((c) => {
    names.set(c.processId, c.processName);
    if (!subsByProcess.has(c.processId)) {
      subsByProcess.set(c.processId, new Set());
    }
    if (c.subProcessId) subsByProcess.get(c.processId)!.add(c.subProcessId);
  });

  const result: Option[] = [];
  subsByProcess.forEach((subs, pid) => {
    const available =
      subs.size > 0
        ? [...subs].some((s) => !assignedKeys.has(`${pid}|${s}`))
        : !assignedKeys.has(`${pid}|`);
    if (available) result.push({ id: pid, label: names.get(pid) || "" });
  });
  return result;
}, [contractors, assignedKeys]);

// Sub process: jo assign ho chuke wo hat jayenge
const subProcessOptions = useMemo<Option[]>(() => {
  if (!selectedProcess) return [];
  const map = new Map<string, Option>();
  contractors.forEach((c) => {
    if (
      c.processId === selectedProcess.id &&
      c.subProcessId &&
      !assignedKeys.has(`${c.processId}|${c.subProcessId}`) &&
      !map.has(c.subProcessId)
    ) {
      map.set(c.subProcessId, { id: c.subProcessId, label: c.subProcessName });
    }
  });
  return [...map.values()];
}, [contractors, selectedProcess, assignedKeys]);
  const hasSubProcess = subProcessOptions.length > 0;

  // Step visibility
  // Main process select hote hi contractor + amount dikhenge.
  // Sub process sirf tab dikhega jab us process ke sub process bane ho.
  const showSubProcess = Boolean(selectedProcess) && hasSubProcess;
  const showContractor = Boolean(selectedProcess);
  const showAmount = Boolean(selectedProcess);

  // Selected process (aur sub process) ke contractors
  const contractorOptions = useMemo(() => {
    if (!selectedProcess) return [];
    return contractors.filter((c) => {
      if (c.processId !== selectedProcess.id) return false;
      if (hasSubProcess && selectedSubProcess) {
        return c.subProcessId === selectedSubProcess.id;
      }
      return true;
    });
  }, [contractors, selectedProcess, selectedSubProcess, hasSubProcess]);

  const pick = (value: any): any =>
    Array.isArray(value) ? value[0] || null : value || null;

  const validate = () => {
    const next: Record<string, string> = {};

    if (!selectedProcess) next.process = "Select Main Process";
    if (hasSubProcess && !selectedSubProcess)
      next.subProcess = "Select Sub Process";
    if (!selectedContractor) next.contractor = "Select Contractor";

    const amt = Number(contractAmount);
    if (!contractAmount.trim()) next.amount = "Enter Contract Amount";
    else if (Number.isNaN(amt) || amt <= 0)
      next.amount = "Enter a valid amount";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!workOrder?.id) {
      toasterrormsg("Work Order not selected");
      return;
    }
    if (!validate()) return;

    try {
      setSaving(true);

      const response = await Post(
        "workorder/assign",
        {
          workOrderId: workOrder.id,
          processId: Number(selectedProcess!.id),
          subProcessId: selectedSubProcess
            ? Number(selectedSubProcess.id)
            : undefined,
          contractorId: selectedContractor!.employeeId,
          // purana backend field bhi bhej rahe hain, taaki abhi ka API na toote
          contractorManagerId: selectedContractor!.employeeId,
          contractAmount: Number(contractAmount),
        },
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          response?.data?.message || "Work Order assigned successfully.",
        );
        onSave();
        close();
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to assign Work Order.",
        );
      }
    } catch (error: any) {
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while assigning Work Order.",
      );
    } finally {
      setSaving(false);
    }
  };

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
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white"
        >
          {/* Header */}
          <div className="bg-primary-600 flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold text-white">
              Assign Work Order
            </h3>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              {/* Work Order info */}
              <div className="dark:bg-dark-800 rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Work Order</div>
                <div className="dark:text-dark-100 mt-1 font-medium text-gray-800">
                  {workOrder?.workOrderNo || "-"}
                </div>
              </div>

              {/* Step 1: Main Process (hamesha) */}
              <div>
                <Combobox
                  data={processes}
                  displayField="label"
                  value={selectedProcess}
                  onChange={(value: any) => {
                    setSelectedProcess(pick(value));
                    setSelectedSubProcess(null);
                    setSelectedContractor(null);
                    setContractAmount("");
                    setErrors({});
                  }}
                  placeholder={
                    dataLoading && processes.length === 0
                      ? "Loading..."
                      : "Select main process"
                  }
                  label="Select Main Process"
                  searchFields={["label"]}
                />
                {errors.process && (
                  <p className="text-error mt-1 text-xs">{errors.process}</p>
                )}
              </div>

              {/* Step 2: Sub Process (sirf tab jab process ke sub process bane ho) */}
              {showSubProcess && (
                <div>
                  <Combobox
                    data={subProcessOptions}
                    displayField="label"
                    value={selectedSubProcess}
                    onChange={(value: any) => {
                      setSelectedSubProcess(pick(value));
                      setSelectedContractor(null);
                      setErrors((p) => ({ ...p, subProcess: "" }));
                    }}
                    placeholder="Select sub process"
                    label="Select Sub Process"
                    searchFields={["label"]}
                  />
                  {errors.subProcess && (
                    <p className="text-error mt-1 text-xs">
                      {errors.subProcess}
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Contractor (main process select hote hi) */}
              {showContractor && (
                <div>
                  <Combobox
                    data={contractorOptions}
                    displayField="label"
                    value={selectedContractor}
                    onChange={(value: any) => {
                      setSelectedContractor(pick(value));
                      setErrors((p) => ({ ...p, contractor: "" }));
                    }}
                    placeholder={
                      contractorOptions.length === 0
                        ? "No contractor found"
                        : "Select contractor"
                    }
                    label="Select Contractor"
                    searchFields={["label"]}
                  />
                  {errors.contractor && (
                    <p className="text-error mt-1 text-xs">
                      {errors.contractor}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Contract Amount (main process select hote hi) */}
              {showAmount && (
                <Input
                  label="Contract Amount"
                  type="number"
                  min={0}
                  placeholder="Enter contract amount"
                  value={contractAmount}
                  error={errors.amount}
                  onChange={(e: any) => {
                    setContractAmount(e.target.value);
                    setErrors((p) => ({ ...p, amount: "" }));
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <Button type="button" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                color="primary"
                onClick={handleSubmit}
                disabled={saving || !selectedProcess}
              >
                {saving ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}