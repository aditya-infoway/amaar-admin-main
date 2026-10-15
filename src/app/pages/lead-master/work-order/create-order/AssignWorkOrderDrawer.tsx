import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import {
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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

// workorder/list ke `processStages` ka ek item (backend: getProcessStageMap)
interface ProcessStage {
  label: string;
  order: number;
  status: "Pending" | "In Progress" | "Completed" | string;
  employeeName?: string;
  employeeMobile?: string;
  assignedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

const toStr = (v: any) =>
  v === undefined || v === null || v === 0 || v === "0" ? "" : String(v);

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const formatTime = (value?: string | null) =>
  value
    ? new Date(value)
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()
    : "-";

const statusColor = (status: string) =>
  status === "Completed"
    ? "text-emerald-500"
    : status === "In Progress"
      ? "text-sky-500"
      : "text-amber-500";

// ---------------- Work Process style timeline (sirf assign hue process) ----------------
function TimeChip({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="border-primary-500/70 bg-primary-500/10 text-primary-600 dark:text-primary-400 flex size-8 items-center justify-center rounded-full border-2 text-[11px] font-semibold">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-0.5 text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

function WorkTime({ stage, now }: { stage: ProcessStage; now: number }) {
  if (!stage.startTime) {
    return <span className="text-sm text-gray-400">-</span>;
  }

  const end = stage.endTime ? new Date(stage.endTime).getTime() : now;
  const totalSec = Math.max(
    0,
    Math.floor((end - new Date(stage.startTime).getTime()) / 1000),
  );

  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <div className="flex items-center gap-1.5">
      {days > 0 && <TimeChip value={days} label="d" />}
      <TimeChip value={hours} label="h" />
      <TimeChip value={mins} label="m" />
      <TimeChip value={secs} label="s" />
    </div>
  );
}

function ProcessTimeline({
  stages,
  now,
}: {
  stages: ProcessStage[];
  now: number;
}) {
  return (
    <div className="dark:border-dark-500 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
      <div className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Work Process
      </div>

      <div>
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const done = stage.status === "Completed";
          const running = stage.status === "In Progress";

          return (
            <div key={`${stage.label}-${index}`} className="flex gap-3">
              {/* Circle + connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    done
                      ? "bg-primary-500 text-white"
                      : running
                        ? "border-primary-500 text-primary-600 dark:text-primary-400 border-2"
                        : "dark:bg-dark-500 bg-gray-100 text-gray-400",
                  ].join(" ")}
                >
                  {done ? (
                    <CheckIcon className="size-5" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                {!isLast && (
                  <div
                    className={[
                      "my-1 w-0.5 grow",
                      done
                        ? "bg-primary-500"
                        : "dark:bg-dark-500 bg-gray-200",
                    ].join(" ")}
                  />
                )}
              </div>

              {/* Details */}
              <div className={isLast ? "grow pb-0" : "grow pb-5"}>
                <div className="flex items-baseline gap-2">
                  <span className="text-primary-500 text-lg font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {stage.label || "-"}
                  </span>
                </div>

                <div
                  className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${statusColor(
                    stage.status,
                  )}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {stage.status}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
                  {/* Manager */}
                  {/* <div>
                    <div className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                      Manager
                    </div>
                    <div className="dark:text-dark-100 mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
                      <UserIcon className="size-4 shrink-0 text-gray-400" />
                      <span className="truncate">
                        {stage.employeeName || "-"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <PhoneIcon className="size-4 shrink-0 text-gray-400" />
                      <span className="truncate">
                        {stage.employeeMobile || "-"}
                      </span>
                    </div>
                  </div> */}

                  {/* Assign date & time */}
                  {/* <div>
                    <div className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                      Assign Date &amp; Time
                    </div>
                    <div className="dark:text-dark-100 mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
                      <CalendarDaysIcon className="size-4 shrink-0 text-gray-400" />
                      {formatDate(stage.assignedAt)}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <ClockIcon className="size-4 shrink-0 text-gray-400" />
                      {formatTime(stage.assignedAt)}
                    </div>
                  </div> */}

                  {/* Work time */}
                  {/* <div className="col-span-2">
                    <div className="mb-1 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                      Work Time
                    </div>
                    <WorkTime stage={stage} now={now} />
                  </div> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  // Sirf assign hue process (workorder/list se aaya `processStages`)
  const processStages = useMemo<ProcessStage[]>(
    () => ((workOrder as any)?.processStages as ProcessStage[]) || [],
    [workOrder],
  );

  // Work Time live chalne ke liye clock (sirf jab koi process In Progress ho)
  const [now, setNow] = useState(Date.now());
  const hasRunning = processStages.some((s) => s.status === "In Progress");

  useEffect(() => {
    if (!isOpen || !hasRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen, hasRunning]);

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
        map.set(c.subProcessId, {
          id: c.subProcessId,
          label: c.subProcessName,
        });
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-lg transform-gpu flex-col bg-white"
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

              {/* Work Process design: sirf jo process assign ho chuki hain */}
             

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
               {processStages.length > 0 ? (
                <ProcessTimeline stages={processStages} now={now} />
              ) : (
                <p className="text-xs text-gray-400">
                  No process assigned yet.
                </p>
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